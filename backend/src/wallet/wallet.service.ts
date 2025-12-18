import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
    private readonly logger = new Logger(WalletService.name);

    constructor(private prisma: PrismaService) { }

    // Get User Wallet (Create if doesn't exist)
    async getWallet(userId: string) {
        let wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
        });

        if (!wallet) {
            this.logger.log(`Creating wallet for user ${userId}`);
            wallet = await this.prisma.wallet.create({
                data: { userId },
                include: { transactions: true }
            });
        }

        return wallet;
    }

    // Top Up (Deposit)
    async topUpWallet(userId: string, amount: number, reference: string) {
        if (amount <= 0) throw new BadRequestException('Amount must be positive');

        const wallet = await this.getWallet(userId);

        // In a real app, verify reference with Paystack/Flutterwave here
        this.logger.log(`Crediting wallet ${wallet.id} with ${amount}`);

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Transaction Record
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type: 'DEPOSIT',
                    reference,
                    status: 'SUCCESS',
                    description: 'Wallet Top-up'
                }
            });

            // 2. Update Balance
            return tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } },
                include: { transactions: { orderBy: { createdAt: 'desc' }, take: 5 } }
            });
        });
    }

    // Pay for Order (Withdrawal)
    async payFromWallet(userId: string, totalAmount: number, orderId: string) {
        const wallet = await this.getWallet(userId);

        if (wallet.balance < totalAmount) {
            throw new BadRequestException('Insufficient wallet balance');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Deduct Balance
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: totalAmount } }
            });

            // 2. Record Transaction
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: totalAmount,
                    type: 'PAYMENT',
                    reference: `PAY-${orderId}`,
                    status: 'SUCCESS',
                    description: `Payment for Order #${orderId.slice(-4)}`
                }
            });

            return updatedWallet;
        });
    }
}
