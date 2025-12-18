
import { Controller, Post, Body, Param, UseGuards, Request, Get } from '@nestjs/common';
import { CourierService } from './courier.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('courier')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COURIER')
export class CourierController {
    constructor(private readonly courierService: CourierService) { }

    @Post('status')
    updateStatus(@Request() req: any, @Body() body: { isOnline: boolean, lat?: number, lng?: number }) {
        return this.courierService.updateStatus(req.user.userId, body.isOnline, body.lat, body.lng);
    }

    @Get('orders')
    getAssignedOrders(@Request() req: any) {
        return this.courierService.getAssignedOrders(req.user.userId);
    }

    @Get('heatmap')
    getHeatmap() {
        return this.courierService.getHeatmapData();
    }

    @Post('orders/:id/complete')
    completeOrder(@Request() req: any, @Param('id') id: string) {
        return this.courierService.completeOrder(req.user.userId, id);
    }
}
