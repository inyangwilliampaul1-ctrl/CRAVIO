
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function main() {
    console.log('--- Menu CRUD Verification ---');

    // 1. Setup: Get a valid Vendor Token
    // We'll use the vendor created in verify-auth.ts (vendor_test_auth@example.com)
    const testEmail = 'vendor_test_auth@example.com';

    // Ensure vendor is APPROVED (should be from verify-auth.ts)
    const user = await prisma.user.findUnique({ where: { email: testEmail }, include: { vendorProfile: true } });
    if (!user || user.vendorProfile?.status !== 'APPROVED') {
        console.error('❌ Prerequisite Failed: Test vendor not found or not approved. Run verify-auth.ts first.');
        process.exit(1);
    }

    // Login to get token
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: 'password123'
    });
    const token = loginRes.data.access_token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✓ Logged in as Vendor');

    // 2. Create Menu Item
    console.log('\n[Create Menu Item]');
    let itemId: string = '';
    try {
        // Need a category ID first. Create one via direct DB for test simplicity or pick existing.
        // VendorService create logic assumes categoryId is passed.
        // Let's create a category for this vendor.
        const cat = await prisma.category.create({
            data: { name: 'Test Category', vendorId: user.vendorProfile!.id }
        });

        const res = await axios.post(`${API_URL}/vendor/menu`, {
            categoryId: cat.id,
            name: 'Jollof Delight',
            description: 'Spicy and tasty',
            price: '2500',
            imageUrl: 'https://placehold.co/jollof.jpg',
            customizationConfig: { extra: 'Plantain' }
        }, config);

        console.log('✓ Item Created:', res.data.name);
        itemId = res.data.id;

    } catch (e: any) {
        console.error('❌ Create Failed:', e.response?.data || e.message);
    }

    // 3. Get Menu
    console.log('\n[Get Menu]');
    try {
        const res = await axios.get(`${API_URL}/vendor/menu`, config);
        console.log(`✓ Menu Items Retrieved: ${res.data.length}`);
        const found = res.data.find((i: any) => i.id === itemId);
        if (found) console.log('✓ Created Item Found in List');
        else console.error('❌ Created Item Not Found');
    } catch (e: any) {
        console.error('❌ Get Failed:', e.response?.data || e.message);
    }

    // 4. Update Menu Item (Check Price Log)
    console.log('\n[Update Menu Item]');
    try {
        const res = await axios.put(`${API_URL}/vendor/menu/${itemId}`, {
            price: '3000', // Price change
            name: 'Jollof Supreme'
        }, config);
        console.log(`✓ Item Updated: ${res.data.name}, Price: ${res.data.price}`);
    } catch (e: any) {
        console.error('❌ Update Failed:', e.response?.data || e.message);
    }

    // 5. Delete Menu Item
    console.log('\n[Delete Menu Item]');
    try {
        await axios.delete(`${API_URL}/vendor/menu/${itemId}`, config);
        console.log('✓ Item Deleted');

        // Verify deletion
        const res = await axios.get(`${API_URL}/vendor/menu`, config);
        const found = res.data.find((i: any) => i.id === itemId);
        if (!found) console.log('✓ Verified: Item gone from list');
        else console.error('❌ Item still exists!');
    } catch (e: any) {
        console.error('❌ Delete Failed:', e.response?.data || e.message);
    }

    await prisma.$disconnect();
}

main();
