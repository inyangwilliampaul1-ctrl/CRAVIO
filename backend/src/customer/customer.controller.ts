
import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get('buy-again')
    getBuyAgain(@Request() req: any) {
        return this.customerService.getBuyAgain(req.user.userId);
    }

    @Post('settings/data-saver')
    toggleDataSaver(@Request() req: any, @Body() body: { enabled: boolean }) {
        return this.customerService.toggleDataSaver(req.user.userId, body.enabled);
    }

    @Get('feed')
    getFeed(@Query('lat') lat?: string, @Query('lng') lng?: string) {
        // Convert to numbers if needed, or update service to accept strings
        // For MVP mock, passing mock string or undefined
        return this.customerService.getFeed(lat);
    }

    @Post('checkout')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER')
    checkout(@Request() req: any, @Body() body: any) {
        return this.customerService.checkout(req.user.userId, body);
    }
}
