
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (!user) return null;

        // For VENDOR, we might want to check password + load profile status?
        // But UsersService.findOne only returns User. 
        // We can fetch profile here OR rely on login() helper to fetch it if needed.
        // For simplicity, let's just validate password here.
        if (await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        let vendorStatus = null;
        if (user.role === 'VENDOR') {
            const fullUser = await this.usersService.findByIdWithProfile(user.id);
            vendorStatus = fullUser?.vendorProfile?.status;
        }

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            vendorStatus: vendorStatus
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                vendorStatus,
            }
        };
    }
    async registerCustomer(userData: any) {
        // Check if exists
        const existing = await this.usersService.findOne(userData.email);
        if (existing) throw new BadRequestException('User already exists');

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await this.usersService.create({
            ...userData,
            password: hashedPassword,
            role: 'CUSTOMER',
            isVerified: true, // Auto-verify customers for now or logic needed
        });
        return this.login(user);
    }

    async registerVendor(userData: any, vendorName: string, location: string) {
        const existing = await this.usersService.findOne(userData.email);
        if (existing) throw new BadRequestException('User already exists');

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Creates User + VendorProfile (PENDING)
        const user = await this.usersService.createVendor({
            ...userData,
            password: hashedPassword,
            role: 'VENDOR',
            isVerified: true
        }, {
            name: vendorName,
            location: location,
            address: location, // duplicating for now
            status: 'PENDING'
        });

        return this.login(user);
    }
}
