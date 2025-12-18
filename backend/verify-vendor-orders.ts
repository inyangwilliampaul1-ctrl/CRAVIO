
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function main() {
    console.log('--- Vendor Order Flow Verification ---');

    // 1. Setup: Get Vendor Token
    const testEmail = 'vendor_test_auth@example.com';
    // Ensure user exists (from previous test)
    const user = await prisma.user.findUnique({ where: { email: testEmail }, include: { vendorProfile: true } });
    if (!user || user.vendorProfile?.status !== 'APPROVED') {
        console.error('❌ Prerequisite Failed: Test vendor not found/approved.');
        process.exit(1);
    }

    // Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: 'password123'
    });
    const token = loginRes.data.access_token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✓ Logged in as Vendor');

    // 2. Setup: Create a PLACED Order for this Vendor
    // Need a customer ID. Pick first customer.
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    if (!customer) { console.error('No customer found'); process.exit(1); }

    const order = await prisma.order.create({
        data: {
            vendorId: user.vendorProfile!.id,
            customerId: customer.id,
            status: 'PLACED',
            deliveryMode: 'DELIVERY',
            paymentMethod: 'CARD',
            foodSubtotal: 2000,
            deliveryFee: 500,
            taxAmount: 150,
            totalAmount: 2650,
            amountPaidUpfront: 2650,
            amountDueOnDelivery: 0,
            deliveryAddress: 'Test Addr',
            deliveryLat: 6.5,
            deliveryLng: 3.4
        }
    });
    console.log(`✓ Created Test Order: ${order.id} (Status: ${order.status})`);

    // 3. Accept Order
    console.log('\n[Accept Order]');
    try {
        const res = await axios.post(`${API_URL}/vendor/orders/${order.id}/accept`, {}, config);
        console.log(`✓ Order Accepted. New Status: ${res.data.status}`);
        if (res.data.status !== 'PREPARING') console.error('❌ Status Mismatch');
    } catch (e: any) {
        console.error('❌ Accept Failed:', e.response?.data || e.message);
    }

    // 4. Mark Ready
    console.log('\n[Mark Ready]');
    try {
        const res = await axios.post(`${API_URL}/vendor/orders/${order.id}/ready`, {}, config);
        console.log(`✓ Order Ready. New Status: ${res.data.status}`);
        if (res.data.status !== 'READY_FOR_PICKUP') console.error('❌ Status Mismatch');
        console.log('✓ (Check Server Logs for "[MATCHING ENGINE] Triggered")');
    } catch (e: any) {
        console.error('❌ Ready Failed:', e.response?.data || e.message);
    }

    await prisma.$disconnect();
}

main();
