
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
    constructor(private prisma: PrismaService) { }

    async getBuyAgain(userId: string) {
        // Find recent order items, group by MenuItem to get unique "Favorites"
        const recentOrders = await this.prisma.order.findMany({
            where: { customerId: userId, status: 'DELIVERED' },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { menuItem: { include: { vendor: true } } } } }
        });

        const map = new Map();
        recentOrders.forEach(order => {
            order.items.forEach(item => {
                if (!map.has(item.menuItemId)) {
                    map.set(item.menuItemId, item.menuItem);
                }
            });
        });

        return Array.from(map.values()).slice(0, 5);
    }

    async toggleDataSaver(userId: string, enabled: boolean) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { dataSaverEnabled: enabled },
            select: { id: true, dataSaverEnabled: true }
        });
    }

    async getFeed(location?: string) {
        // Mock location filter for now. Return all vendors who are APPROVED.
        return this.prisma.vendorProfile.findMany({
            where: { status: 'APPROVED' },
            select: {
                id: true,
                name: true,      // Vendor Name (Business Name)
                location: true,
                menuItems: {
                    take: 5,
                    where: { isAvailable: true }
                }
            }
        });
    }

    async validateAndCalculateOrder(dto: any) {
        const { vendorId, items, paymentMethod } = dto;

        // 1. Check Vendor
        const vendor = await this.prisma.vendorProfile.findUnique({ where: { id: vendorId } });
        if (!vendor) throw new NotFoundException('Vendor not found');
        if (!vendor.isOpen) throw new BadRequestException('Vendor is currently closed');

        // 2. Validate Items & Calculate Food Subtotal
        let foodSubtotal = 0;
        const verifiedItems = [];

        for (const itemDto of items) {
            const menuItem = await this.prisma.menuItem.findUnique({ where: { id: itemDto.menuItemId } });
            if (!menuItem) throw new NotFoundException(`Menu Item ${itemDto.menuItemId} not found`);
            if (menuItem.vendorId !== vendorId) throw new BadRequestException(`Item ${menuItem.name} does not belong to this vendor`);

            const price = menuItem.price; // Trust DB price
            const lineTotal = price * itemDto.quantity;
            foodSubtotal += lineTotal;

            verifiedItems.push({
                ...itemDto,
                price: price,
                name: menuItem.name
            });
        }

        // 3. Calculate Fees
        const taxRate = 0.075; // 7.5%
        const taxAmount = foodSubtotal * taxRate;
        const deliveryFee = 1000.0; // Fixed for now, or calc distance based
        const totalAmount = foodSubtotal + taxAmount + deliveryFee;

        // 4. Payment Splitting Logic
        let amountPaidUpfront = 0;
        let amountDueOnDelivery = 0;

        if (paymentMethod === 'PARTIAL_COURIER') {
            // Pay Food + Tax online. Pay Delivery Fee to Rider.
            amountPaidUpfront = foodSubtotal + taxAmount;
            amountDueOnDelivery = deliveryFee;
        } else {
            // Pay ALL online (CARD / TRANSFER)
            amountPaidUpfront = totalAmount;
            amountDueOnDelivery = 0;
        }

        return {
            vendorId,
            foodSubtotal,
            taxAmount,
            deliveryFee,
            totalAmount,
            amountPaidUpfront,
            amountDueOnDelivery,
            verifiedItems
        };
    }

    async checkout(userId: string, dto: any) {
        const calculation = await this.validateAndCalculateOrder(dto);

        // Create Order
        const order = await this.prisma.order.create({
            data: {
                customerId: userId,
                vendorId: calculation.vendorId,
                status: 'PLACED',
                deliveryMode: 'DELIVERY', // Default
                paymentMethod: dto.paymentMethod || 'CARD',
                foodSubtotal: calculation.foodSubtotal,
                taxAmount: calculation.taxAmount,
                deliveryFee: calculation.deliveryFee,
                totalAmount: calculation.totalAmount,
                amountPaidUpfront: calculation.amountPaidUpfront,
                amountDueOnDelivery: calculation.amountDueOnDelivery,
                deliveryAddress: dto.deliveryAddress,
                deliveryLat: dto.deliveryLat,
                deliveryLng: dto.deliveryLng,
                items: {
                    create: calculation.verifiedItems.map((i: any) => ({
                        menuItemId: i.menuItemId,
                        quantity: i.quantity,
                        price: i.price
                    }))
                }
            }
        });

        return {
            message: 'Order placed successfully',
            order,
            paystackReference: `REF-${Date.now()}` // Mock
        };
    }
}
