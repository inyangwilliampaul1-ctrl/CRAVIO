
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class CourierService {
    private readonly logger = new Logger(CourierService.name);

    constructor(
        private prisma: PrismaService,
        private eventsGateway: EventsGateway
    ) { }

    async updateStatus(userId: string, isOnline: boolean, lat?: number, lng?: number) {
        const courier = await this.prisma.courierProfile.findUnique({ where: { userId } });
        if (!courier) throw new NotFoundException('Courier profile not found');

        return this.prisma.courierProfile.update({
            where: { id: courier.id },
            data: {
                isOnline,
                currentLat: lat,
                currentLng: lng
            }
        });
    }

    async getHeatmapData() {
        // Mock Data for "High Demand Zones" in Lagos
        // In production, this would be aggregation query:
        // await this.prisma.order.groupBy({ by: ['deliveryLat', 'deliveryLng'], _count: true ... })
        return [
            { lat: 6.4253, lng: 3.4000, intensity: 0.9 }, // VI Central
            { lat: 6.4300, lng: 3.4100, intensity: 0.8 }, // VI Extension
            { lat: 6.4500, lng: 3.4500, intensity: 0.7 }, // Lekki Phase 1
            { lat: 6.4400, lng: 3.4200, intensity: 0.6 }, // Oniru
            { lat: 6.4550, lng: 3.4300, intensity: 0.5 }, // Ikoyi
        ];
    }

    async getAssignedOrders(userId: string) {
        const courier = await this.prisma.courierProfile.findUnique({ where: { userId } });
        if (!courier) return [];
        return this.prisma.order.findMany({
            where: { courierId: courier.id, status: { not: 'DELIVERED' } },
            include: { vendor: true, items: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Matching Algorithm
    async findAndAssignCourier(orderId: string, vendorLat: number, vendorLng: number) {
        this.logger.log(`Finding courier for order ${orderId} near ${vendorLat}, ${vendorLng}`);

        // 1. Get Online Couriers
        const couriers = await this.prisma.courierProfile.findMany({
            where: { isOnline: true }
        });

        if (couriers.length === 0) {
            this.logger.warn(`No online couriers found for order ${orderId}`);
            return null; // Handle retry logic later
        }

        // 2. Calculate Distances (Simple Euclidean for MVP, Haversine better for Prod)
        // Filtering < 5km approx (0.045 degrees)
        const nearbyCouriers = couriers.map((c: any) => {
            if (!c.currentLat || !c.currentLng) return null;
            const dist = Math.sqrt(
                Math.pow(c.currentLat - vendorLat, 2) + Math.pow(c.currentLng - vendorLng, 2)
            );
            return { ...c, dist };
        }).filter((c: any) => c && c.dist < 0.05).sort((a: any, b: any) => a!.dist - b!.dist);

        if (nearbyCouriers.length === 0) {
            this.logger.warn(`No nearby couriers for order ${orderId}`);
            return null;
        }

        const bestCourier = nearbyCouriers[0];
        if (!bestCourier) return null;

        // 3. Assign
        this.logger.log(`Assigning Order ${orderId} to Courier ${bestCourier.id}`);

        // Notify Courier
        this.eventsGateway.server.emit(`courier_request_${bestCourier.userId}`, {
            orderId,
            vendorLocation: { lat: vendorLat, lng: vendorLng }
        });

        // For MVP: Auto-Accept/Assign in DB? Or wait for courier accept?
        // Let's UPDATE Order to have courierId but keep Status READY (or RIDER_ASSIGNED if we added it)
        // Schema has courierId. Status could be 'ACCEPTED' (by Vendor) -> 'PREPARING' -> 'READY_FOR_PICKUP'
        // Let's add 'IN_TRANSIT' or similar, but for now we just link them.

        return this.prisma.order.update({
            where: { id: orderId },
            data: { courierId: bestCourier.id }
        });
    }

    async completeOrder(userId: string, orderId: string) {
        const courier = await this.prisma.courierProfile.findUnique({ where: { userId } });
        if (!courier) throw new NotFoundException('Courier not found');

        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');
        if (order.courierId !== courier.id) throw new BadRequestException('Not your order');

        // Update Order
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'DELIVERED' }
        });

        // Update Cash Balance
        // If amountDueOnDelivery > 0, Courier collects cash. They OWE app (delivery fee + food cost if paid by app to vendor).
        // Simplification: Courier owes App the (Total - CourierFee) if they collect Full Cash.
        // Actually: 
        // Case 1: Prepaid. Client paid App. App owes Courier 'deliveryFee'.
        // Case 2: COD. Client pays Courier 'Total'. Courier owes App 'Total - deliveryFee'.

        const deliveryFee = order.deliveryFee;
        const collectedCash = order.amountDueOnDelivery;

        let balanceChange = 0;

        if (collectedCash > 0) {
            // Courier collected cash. They owe App (Cash - Their Fee).
            // Example: Collected 5000. Fee 1000. Owe 4000.
            balanceChange = collectedCash - deliveryFee;
        } else {
            // Prepaid. App owes Courier their fee.
            // Using logic: Positive Balance = Debt to App. Negative Balance = App owes Courier.
            balanceChange = -deliveryFee;
        }

        await this.prisma.courierProfile.update({
            where: { id: courier.id },
            data: {
                cashBalance: { increment: balanceChange }
            }
        });

        return { order: updatedOrder, balanceChange };
    }
}
