import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    getMyWallet(@Request() req: any) {
        return this.walletService.getWallet(req.user.userId);
    }

    @Post('topup')
    topUpWallet(@Request() req: any, @Body() body: { amount: number, reference: string }) {
        return this.walletService.topUpWallet(req.user.userId, body.amount, body.reference);
    }
}
