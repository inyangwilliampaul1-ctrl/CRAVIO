
import { Controller, Post, Body, UseGuards, Get, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(200)
    @Post('login')
    async login(@Body() req: any) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            return { message: 'Invalid credentials' };
        }
        return this.authService.login(user);
    }

    @Post('signup/customer')
    async signupCustomer(@Body() body: any) {
        return this.authService.registerCustomer(body);
    }

    @Post('signup/vendor')
    async signupVendor(@Body() body: any) {
        return this.authService.registerVendor(
            { email: body.email, password: body.password, phone: body.phone, fullName: body.fullName },
            body.vendorName,
            body.location
        );
    }

    // Helper to test token
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
