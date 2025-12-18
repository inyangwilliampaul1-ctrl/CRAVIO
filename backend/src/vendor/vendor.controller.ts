
import { Controller, Get, UseGuards, Request, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IsApprovedVendorGuard } from '../auth/guards/approved-vendor.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VendorService } from './vendor.service';

@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
    constructor(private vendorService: VendorService) { }

    @Get('dashboard')
    @Roles('VENDOR')
    @UseGuards(IsApprovedVendorGuard)
    getDashboard(@Request() req: any) {
        return { message: 'Welcome to Vendor Dashboard', user: req.user };
    }

    @Get('status')
    @Roles('VENDOR')
    getStatus(@Request() req: any) {
        return { status: req.user.vendorStatus, message: 'You can see this even if PENDING' };
    }

    @Get('orders')
    @Roles('VENDOR')
    @UseGuards(IsApprovedVendorGuard)
    getOrders(@Request() req: any) {
        return this.vendorService.getVendorOrders(req.user.userId);
    }

    // --- Menu Management ---

    @Get('menu')
    @Roles('VENDOR')
    @UseGuards(IsApprovedVendorGuard)
    async getMenu(@Request() req: any) {
        return this.vendorService.getVendorMenuByUserId(req.user.userId);
    }

    @Post('menu')
    @Roles('VENDOR')
    @UseGuards(IsApprovedVendorGuard)
    createItem(@Request() req: any, @Body() body: any) {
        return this.vendorService.createMenuItem(req.user.userId, body);
    }

    @Put('menu/:id')
    @Roles('VENDOR')
    @UseGuards(IsApprovedVendorGuard)
    updateItem(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        return this.vendorService.updateMenuItem(req.user.userId, id, body);
    }

    @Delete('menu/:id')
    @Roles('VENDOR')
    @UseGuards(IsApprovedVendorGuard)
    deleteItem(@Request() req: any, @Param('id') id: string) {
        return this.vendorService.deleteMenuItem(req.user.userId, id);
    }

    // --- Order Management ---

    @Post('orders/:id/accept')
    @Roles('VENDOR')
    @UseGuards(IsApprovedVendorGuard)
    acceptOrder(@Request() req: any, @Param('id') id: string) {
        return this.vendorService.acceptOrder(req.user.userId, id);
    }

    @Post('orders/:id/ready')
    @Roles('VENDOR')
    @UseGuards(IsApprovedVendorGuard)
    readyOrder(@Request() req: any, @Param('id') id: string) {
        return this.vendorService.readyOrder(req.user.userId, id);
    }
}
