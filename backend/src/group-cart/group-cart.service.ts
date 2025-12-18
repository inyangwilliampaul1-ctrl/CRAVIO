import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class GroupCartService {
    constructor(private prisma: PrismaService) { }

    // 1. Create Group Cart (Host Only)
    async createCart(hostUserId: string) {
        // Generate short 6-char code
        const code = randomBytes(3).toString('hex').toUpperCase();

        return this.prisma.groupCart.create({
            data: {
                hostId: hostUserId,
                code,
                isActive: true
            }
        });
    }

    // 2. Join/View Cart (Open to anyone with code)
    async getCart(code: string) {
        const cart = await this.prisma.groupCart.findUnique({
            where: { code },
            include: {
                host: { select: { fullName: true, id: true } },
                items: { include: { menuItem: true } }
            }
        });

        if (!cart) throw new NotFoundException('Cart not found');
        if (!cart.isActive) throw new BadRequestException('This cart has been closed');

        return cart;
    }

    // 3. Add Item to Cart (Guest or Host)
    async addItem(code: string, menuItemId: string, quantity: number, addedBy: string, addedById?: string) {
        const cart = await this.getCart(code);

        return this.prisma.groupCartItem.create({
            data: {
                cartId: cart.id,
                menuItemId,
                quantity,
                addedBy,
                addedById
            }
        });
    }

    // 4. Checkout (Host Only)
    // Converts GroupCart to a regular Order
    async checkout(hostUserId: string, cartId: string, paymentMethod: 'WALLET' | 'CARD') {
        const cart = await this.prisma.groupCart.findUnique({
            where: { id: cartId },
            include: { items: { include: { menuItem: true } } }
        });

        if (!cart) throw new NotFoundException('Cart not found');
        if (cart.hostId !== hostUserId) throw new ForbiddenException('Only the host can checkout');
        if (!cart.isActive) throw new BadRequestException('Cart is already closed');
        if (cart.items.length === 0) throw new BadRequestException('Cart is empty');

        // Calculate Totals
        const foodSubtotal = cart.items.reduce((sum: number, item: any) => sum + (item.menuItem.price * item.quantity), 0);
        const deliveryFee = 1500; // Fixed for MVP
        const taxAmount = foodSubtotal * 0.075;
        const totalAmount = foodSubtotal + deliveryFee + taxAmount;

        // Verify Payment (Wallet Logic if applicable)
        if (paymentMethod === 'WALLET') {
            const wallet = await this.prisma.wallet.findUnique({ where: { userId: hostUserId } });
            if (!wallet || wallet.balance < totalAmount) {
                throw new BadRequestException('Insufficient wallet balance');
            }
        }

        return this.prisma.$transaction(async (tx: any) => {
            // 1. Create Order
            // We need a vendor. For group orders, assuming single vendor for now. 
            // In a real app, we'd check if mixed vendors or restrict cart to first vendor.
            const vendorId = cart.items[0].menuItem.vendorId;

            const order = await tx.order.create({
                data: {
                    customerId: hostUserId,
                    vendorId,
                    status: 'PLACED',
                    deliveryMode: 'DELIVERY',
                    paymentMethod: paymentMethod === 'WALLET' ? 'CARD' : 'CARD', // Mapping wallet to card for now or add enum
                    foodSubtotal,
                    deliveryFee,
                    taxAmount,
                    totalAmount,
                    amountPaidUpfront: totalAmount,
                    deliveryAddress: 'Host Address (Mock)', // Should be passed in
                    items: {
                        create: cart.items.map((item: any) => ({
                            menuItemId: item.menuItemId,
                            quantity: item.quantity,
                            price: item.menuItem.price
                        }))
                    }
                }
            });

            // 2. Close Cart
            await tx.groupCart.update({
                where: { id: cartId },
                data: { isActive: false }
            });

            return order;
        });
    }
}
