
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function main() {
    console.log('--- Customer API Verification ---');

    // 1. Setup: Get Customer Token
    const freshEmail = `cust_${Date.now()}@example.com`;
    await axios.post(`${API_URL}/auth/signup/customer`, {
        email: freshEmail,
        password: 'password123',
        fullName: 'Feed Tester',
        phone: `080${Date.now().toString().slice(-8)}`
    });
    const login = await axios.post(`${API_URL}/auth/login`, { email: freshEmail, password: 'password123' });
    const token = login.data.access_token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✓ Logged in as Customer');

    // 2. Test Feed
    console.log('\n[Get Feed]');
    try {
        const res = await axios.get(`${API_URL}/customer/feed`, {});
        console.log(`✓ Feed Retrieved. Vendors: ${res.data.length}`);
        if (res.data.length > 0) {
            console.log(`  - First Vendor: ${res.data[0].name}`);
            console.log(`  - Items: ${res.data[0].menuItems.length}`);
        }
    } catch (e: any) {
        console.error('❌ Feed Failed:', e.response?.data || e.message);
    }

    // 3. Test Checkout
    console.log('\n[Test Checkout]');
    // Need a vendor and item. Use first approved vendor from DB.
    const vendor = await prisma.vendorProfile.findFirst({
        where: { status: 'APPROVED' },
        include: { menuItems: true }
    });

    if (!vendor || vendor.menuItems.length === 0) {
        console.error('❌ No vendor/items found for checkout test');
    } else {
        const item = vendor.menuItems[0];
        try {
            const res = await axios.post(`${API_URL}/customer/checkout`, {
                vendorId: vendor.id,
                items: [{ menuItemId: item.id, quantity: 2 }],
                paymentMethod: 'CARD', // Full payment
                deliveryAddress: 'Lagos Island',
                deliveryLat: 6.45,
                deliveryLng: 3.4
            }, config);

            const order = res.data.order;
            console.log(`✓ Order Placed: ${order.id}`);
            console.log(`  - Total: ${order.totalAmount} (Item: ${item.price} * 2 + Tax + Delivery)`);
            console.log(`  - Paystack Ref: ${res.data.paystackReference}`);

            // Verify Calculation roughly
            // 2 * price + (2 * price * 0.075) + 1000
            const expected = (item.price * 2) + (item.price * 2 * 0.075) + 1000;
            if (Math.abs(order.totalAmount - expected) < 1.0) console.log('✓ Calculation Verified');
            else console.warn(`⚠️ Calculation Mismatch? Got ${order.totalAmount}, Expected ${expected}`);

        } catch (e: any) {
            console.error('❌ Checkout Failed:', e.response?.data || e.message);
        }
    }

    await prisma.$disconnect();
}

main();
