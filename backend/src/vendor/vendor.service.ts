
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';
import { CourierService } from '../courier/courier.service';

@Injectable()
export class VendorService {
    constructor(
        private prisma: PrismaService,
        private eventsGateway: EventsGateway,
        private courierService: CourierService
    ) { }

    async getVendorProfile(userId: string) {
        return this.prisma.vendorProfile.findUnique({ where: { userId } });
    }

    async getVendorMenu(vendorId: string) {
        return this.prisma.menuItem.findMany({
            where: { vendorId },
            include: { category: true }
        });
    }

    // Helper for Controller
    async getVendorMenuByUserId(userId: string) {
        const vendor = await this.getVendorProfile(userId);
        if (!vendor) return [];
        return this.getVendorMenu(vendor.id);
    }

    async getVendorOrders(userId: string) {
        const vendor = await this.getVendorProfile(userId);
        if (!vendor) return [];
        return this.prisma.order.findMany({
            where: { vendorId: vendor.id },
            include: { items: { include: { menuItem: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    // --- Order Management ---

    async acceptOrder(userId: string, orderId: string) {
        const vendor = await this.getVendorProfile(userId);
        if (!vendor) throw new ForbiddenException('Vendor not found');

        // Verify order belongs to vendor
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, vendorId: vendor.id }
        });
        if (!order) throw new NotFoundException('Order not found');

        if (order.status !== 'PLACED') throw new BadRequestException(`Cannot accept order in status ${order.status}`);

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'PREPARING' }
        });

        // Emit Event
        this.eventsGateway.server.emit('order_accepted', { orderId: updated.id, status: 'PREPARING' });

        return updated;
    }

    async readyOrder(userId: string, orderId: string) {
        const vendor = await this.getVendorProfile(userId);
        if (!vendor) throw new ForbiddenException('Vendor not found');

        const order = await this.prisma.order.findFirst({
            where: { id: orderId, vendorId: vendor.id }
        });
        if (!order) throw new NotFoundException('Order not found');

        if (order.status !== 'PREPARING') throw new BadRequestException(`Cannot mark ready from status ${order.status}`);

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'READY_FOR_PICKUP' }
        });

        // Emit Event
        this.eventsGateway.server.emit('order_ready', { orderId: updated.id, status: 'READY_FOR_PICKUP' });

        // Trigger Matching
        const vendorLat = 6.45; // Hardcoded Lagos Island Lat for MVP
        const vendorLng = 3.40; // Hardcoded Lagos Island Lng for MVP

        await this.courierService.findAndAssignCourier(orderId, vendorLat, vendorLng);

        return updated;
    }

    async createMenuItem(userId: string, data: any) {
        // 1. Verify Vendor Ownership
        const vendor = await this.getVendorProfile(userId);
        if (!vendor || vendor.status !== 'APPROVED') {
            throw new ForbiddenException('Vendor not approved or not found');
        }

        return this.prisma.menuItem.create({
            data: {
                vendorId: vendor.id,
                categoryId: data.categoryId,
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                imageUrl: data.imageUrl,
                customizationConfig: JSON.stringify(data.customizationConfig || {})
            }
        });
    }

    async updateMenuItem(userId: string, itemId: string, data: any) {
        const vendor = await this.getVendorProfile(userId);
        if (!vendor) throw new ForbiddenException('Vendor not found');

        const item = await this.prisma.menuItem.findFirst({
            where: { id: itemId, vendorId: vendor.id }
        });
        if (!item) throw new NotFoundException('Menu item not found or access denied');

        // Log Price Change
        if (data.price && parseFloat(data.price) !== item.price) {
            console.log(`[PRICE CHANGE] Item ${item.name} (${item.id}) changed from ${item.price} to ${data.price} by Vendor ${vendor.name}`);
        }

        return this.prisma.menuItem.update({
            where: { id: itemId },
            data: {
                ...data,
                price: data.price ? parseFloat(data.price) : undefined,
                customizationConfig: data.customizationConfig ? JSON.stringify(data.customizationConfig) : undefined
            }
        });
    }

    async deleteMenuItem(userId: string, itemId: string) {
        const vendor = await this.getVendorProfile(userId);
        if (!vendor) throw new ForbiddenException('Vendor not found');

        const count = await this.prisma.menuItem.deleteMany({
            where: { id: itemId, vendorId: vendor.id }
        });

        if (count.count === 0) throw new NotFoundException('Item not found');
        return { message: 'Item deleted' };
    }
}
