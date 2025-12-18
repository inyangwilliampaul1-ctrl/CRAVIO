
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByIdWithProfile(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { vendorProfile: true, courierProfile: true }
        });
    }
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async createVendor(data: Prisma.UserCreateInput, vendorProfile: Prisma.VendorProfileCreateWithoutUserInput): Promise<User> {
        return this.prisma.user.create({
            data: {
                ...data,
                vendorProfile: {
                    create: vendorProfile
                }
            },
            include: { vendorProfile: true }
        });
    }
}
