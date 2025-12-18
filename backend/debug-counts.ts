
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Debug Counts ---');
    const vendorCount = await prisma.vendorProfile.count();
    const categoryCount = await prisma.category.count();
    const menuItemCount = await prisma.menuItem.count();

    console.log(`Vendors: ${vendorCount}`);
    console.log(`Categories: ${categoryCount}`);
    console.log(`MenuItems: ${menuItemCount}`);

    if (categoryCount > 0) {
        const cat = await prisma.category.findFirst({ include: { vendor: true } });
        console.log(`Sample Category: ${cat?.name} (Vendor: ${cat?.vendor.name})`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
