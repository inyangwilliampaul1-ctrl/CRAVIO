
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function main() {
    console.log('--- Auth & Security Verification ---');

    // 1. Cleanup previous test data
    const testEmail = 'vendor_test_auth@example.com';
    await prisma.user.deleteMany({ where: { email: testEmail } });

    // 2. Register Vendor
    console.log('\n[Register Vendor]');
    try {
        const res = await axios.post(`${API_URL}/auth/signup/vendor`, {
            email: testEmail,
            password: 'password123',
            fullName: 'Test Vendor Auth',
            phone: '+2349090000002',
            vendorName: 'Test Auth Bistro',
            location: 'Lagos'
        });
        console.log('✓ Registration Status:', res.status);
        console.log('✓ Token Received:', !!res.data.access_token);
        console.log('✓ User Role:', res.data.user.role);
        console.log('✓ Vendor Profile Status:', res.data.user.vendorStatus || 'UNKNOWN');

        const token = res.data.access_token;

        // 3. Test Restricted Endpoint (DASHBOARD - Requires APPROVED)
        console.log('\n[Test Restricted Dashboard (Expect 403)]');
        try {
            await axios.get(`${API_URL}/vendor/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('❌ Failed: Dashboard access should be forbidden!');
        } catch (e: any) {
            if (e.response && e.response.status === 403) {
                console.log('✓ Success: Access Forbidden (403) as expected for PENDING vendor.');
            } else {
                console.error('❌ Unexpected Error:', e.message);
            }
        }

        // 4. Test Allowed Endpoint (STATUS - PENDING OK)
        console.log('\n[Test Allowed Status Endpoint]');
        try {
            const statusRes = await axios.get(`${API_URL}/vendor/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✓ Success: Access Granted to Status.');
            console.log('Message:', statusRes.data.message);
        } catch (e: any) {
            console.error('❌ Failed to access status:', e.message);
        }

        // 5. Manual Approval
        console.log('\n[Approving Vendor in DB...]');
        const user = await prisma.user.findUnique({ where: { email: testEmail } });
        if (user) {
            await prisma.vendorProfile.update({
                where: { userId: user.id },
                data: { status: 'APPROVED' }
            });
            console.log('✓ Vendor Manually Approved.');
        } else {
            console.error('❌ Could not find user to approve');
        }

        // 6. Test Restricted Endpoint AGAIN (Expect 200)
        console.log('\n[Test Restricted Dashboard (Expect 200)]');
        // Note: In real JWT flow, status is in token. If we changed DB status, the old token still has "PENDING" in payload!
        // The Guard checks `user.vendorStatus` which comes from `req.user` which comes from Payload.
        // SO: We must Re-Login to get a new token with APPROVED status!

        console.log('-> Re-Logging in to get fresh token...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testEmail,
            password: 'password123'
        });
        const newToken = loginRes.data.access_token;

        try {
            const dashRes = await axios.get(`${API_URL}/vendor/dashboard`, {
                headers: { Authorization: `Bearer ${newToken}` }
            });
            console.log('✓ Success: Dashboard Access Granted!');
            console.log('Data:', dashRes.data);
        } catch (e: any) {
            console.error('❌ Failed (Even after approval):', e.response?.data || e.message);
        }

    } catch (e: any) {
        console.error('❌ Test Failed:', e.response?.data || e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
