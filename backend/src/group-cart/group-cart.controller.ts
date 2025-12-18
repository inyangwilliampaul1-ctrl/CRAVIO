import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { GroupCartService } from './group-cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard'; // need to implement this or just use conditional logic

@Controller('cart/group')
export class GroupCartController {
    constructor(private readonly cartService: GroupCartService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    createCart(@Request() req: any) {
        return this.cartService.createCart(req.user.userId);
    }

    @Get(':code')
    getCart(@Param('code') code: string) {
        return this.cartService.getCart(code);
    }

    @Post(':code/items')
    addItem(
        @Param('code') code: string,
        @Body() body: { menuItemId: string, quantity: number, guestName: string }
    ) {
        // For now, allowing anonymous adds via guestName
        return this.cartService.addItem(code, body.menuItemId, body.quantity, body.guestName);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/checkout')
    checkout(@Request() req: any, @Param('id') id: string, @Body() body: { paymentMethod: 'WALLET' | 'CARD' }) {
        return this.cartService.checkout(req.user.userId, id, body.paymentMethod);
    }
}
