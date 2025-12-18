
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Test Credentials ---');

    // Vendor
    const vendor = await prisma.user.findFirst({
        where: { role: 'VENDOR', vendorProfile: { status: 'APPROVED' } },
        include: { vendorProfile: true }
    });
    console.log(`\n[VENDOR]`);
    console.log(`Business: ${vendor?.vendorProfile?.name}`);
    console.log(`Email: ${vendor?.email}`);
    console.log(`Password: password123`);

    // Courier
    const courier = await prisma.user.findFirst({
        where: { role: 'COURIER' },
        include: { courierProfile: true }
    });
    console.log(`\n[COURIER]`);
    console.log(`Name: ${courier?.fullName}`);
    console.log(`Email: ${courier?.email}`);
    console.log(`Password: password123`);

    // Customer
    const customer = await prisma.user.findFirst({
        where: { role: 'CUSTOMER' }
    });
    console.log(`\n[CUSTOMER]`);
    console.log(`Name: ${customer?.fullName}`);
    console.log(`Email: ${customer?.email}`);
    console.log(`Password: password123`);

    await prisma.$disconnect();
}

main();
