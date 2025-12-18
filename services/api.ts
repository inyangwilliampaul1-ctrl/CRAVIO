import axios from 'axios';
import mockData from '../mock_data.json';
import { FoodItem, Order, Restaurant, User } from '../types';

// TOGGLE THIS TO SWITCH BACK TO REAL BACKEND
const USE_MOCK_DATA = true;

// Automatically detects if it's local or cloud
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mappers to ensure type safety with raw JSON
const mapFoodItem = (raw: any, vendor: any): FoodItem => ({
    id: raw.id,
    restaurantId: vendor.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    imageUrl: raw.imageUrl,
    prepTimeMinutes: 20, // Default
    available: raw.isAvailable,
    category: raw.category,
    likes: Math.floor(Math.random() * 500) + 50, // Mock likes
    reviews: [] // Mock empty reviews
});

const mapRestaurant = (raw: any): Restaurant => ({
    id: raw.id,
    name: raw.name,
    rating: 4.5, // Default good rating
    imageUrl: `https://placehold.co/600x400?text=${raw.name.charAt(0)}`, // Placeholder logic
    address: raw.address,
    category: 'General',
    isOpen: true,
    status: raw.status as any,
    businessRegNo: 'RC123456',
    bvn: '22222222222'
});

export const auth = {
    login: async (email: string, password: string = 'password123') => {
        if (USE_MOCK_DATA) {
            await delay(500);
            // Find user in mock data
            const user = mockData.users.find((u: any) => u.email === email);
            if (user) {
                return {
                    access_token: 'mock_token_' + user.id,
                    user: {
                        id: user.id,
                        name: user.fullName,
                        email: user.email,
                        role: user.role
                    }
                };
            }
            // Auto-login generic if not found (for easy testing)
            return {
                access_token: 'mock_token_generic',
                user: { id: 'user_gen', name: 'Test User', email, role: 'CUSTOMER' }
            };
        }
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.access_token);
        return data;
    }
};

export const customer = {
    getFeed: async () => {
        if (USE_MOCK_DATA) {
            await delay(800);
            const vendors = mockData.vendors;
            const allItems: FoodItem[] = [];

            vendors.forEach((v: any) => {
                if (v.menuItems) {
                    v.menuItems.forEach((item: any) => {
                        allItems.push(mapFoodItem(item, v));
                    });
                }
            });

            return {
                restaurants: vendors.map(mapRestaurant),
                featuredItems: allItems.slice(0, 5), // Top 5
                recommededItems: allItems // All items for feed
            };
        }

        try {
            const { data } = await api.get('/customer/feed');
            return data;
        } catch (e) {
            console.warn("API Error, falling back to empty feed", e);
            return { restaurants: [], featuredItems: [], recommededItems: [] };
        }
    },
    checkout: async (payload: any) => {
        if (USE_MOCK_DATA) {
            await delay(1500);
            return { success: true, orderId: 'ord_' + Date.now() };
        }
        const { data } = await api.post('/customer/checkout', payload);
        return data;
    },
    getBuyAgain: async () => {
        if (USE_MOCK_DATA) {
            // Return random items
            const vendors = mockData.vendors;
            if (vendors.length > 0 && vendors[0].menuItems) {
                return vendors[0].menuItems.slice(0, 3).map((i: any) => mapFoodItem(i, vendors[0]));
            }
            return [];
        }
        return [];
    }
};

export const vendor = {
    getOrders: async () => {
        if (USE_MOCK_DATA) {
            await delay(600);
            const rawOrders = (mockData as any).orders || [];
            // Ensure items exists on every order
            return rawOrders.map((o: any) => ({
                ...o,
                items: o.items || [],
                timestamp: o.createdAt ? new Date(o.createdAt).getTime() : Date.now() // Fix NaN issue
            }));
        }
        const { data } = await api.get('/vendor/orders');
        return data;
    },
    updateStatus: async (orderId: string, status: string) => {
        if (USE_MOCK_DATA) {
            // Update local mock state if possible, or just return success
            // Since we can't easily write to JSON, we return success and rely on optimistic UI or assumed refresh
            // But verify: Does App.tsx rely on poll? Yes. Polling will fetch same immutable mock data...
            // So Mock mode won't visually update order status unless we update the mockData in memory or App.tsx handles it local state.
            // App.tsx: setOrders(data). It overwrites state.
            // So if Mock Data is static, the status will revert.
            // WE NEED TO INTERCEPT THE GET ORDERS MOCK to remember changes?
            // For now, let's just implement the method. The user might have a backend running or we accept the reversion.
            // Actually, `mock_data.json` is imported in `api.ts`. We can mutate the in-memory object!
            const order = (mockData as any).orders.find((o: any) => o.id === orderId);
            if (order) order.status = status;
            return { success: true, status };
        }
        const { data } = await api.patch(`/vendor/orders/${orderId}/status`, { status });
        return data;
    },
    acceptOrder: async (orderId: string) => { // Deprecated but kept for safety
        if (USE_MOCK_DATA) return { success: true, status: 'ACCEPTED' };
        const { data } = await api.post(`/vendor/orders/${orderId}/accept`);
        return data;
    },
    readyOrder: async (orderId: string) => { // Deprecated
        if (USE_MOCK_DATA) return { success: true, status: 'READY' };
        const { data } = await api.post(`/vendor/orders/${orderId}/ready`);
        return data;
    }
};

export const courier = {
    setStatus: async (isOnline: boolean, lat: number, lng: number) => {
        if (USE_MOCK_DATA) return { success: true };
        const { data } = await api.post('/courier/status', { isOnline, lat, lng });
        return data;
    },
    getAssignedOrders: async () => {
        if (USE_MOCK_DATA) {
            // Return orders that are ready for pickup or assigned
            const rawOrders = (mockData as any).orders.filter((o: any) => ['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_WAY'].includes(o.status));
            return rawOrders.map((o: any) => ({
                ...o,
                items: o.items || [],
                timestamp: o.createdAt ? new Date(o.createdAt).getTime() : Date.now()
            }));
        }
        const { data } = await api.get('/courier/orders');
        return data;
    },
    updateStatus: async (orderId: string, status: string) => {
        if (USE_MOCK_DATA) {
            const order = (mockData as any).orders.find((o: any) => o.id === orderId);
            if (order) order.status = status;
            return { success: true, status };
        }
        const { data } = await api.patch(`/courier/orders/${orderId}/status`, { status });
        return data;
    },
    completeOrder: async (orderId: string) => {
        if (USE_MOCK_DATA) {
            const order = (mockData as any).orders.find((o: any) => o.id === orderId);
            if (order) order.status = 'DELIVERED';
            return { success: true, status: 'DELIVERED' };
        }
        const { data } = await api.post(`/courier/orders/${orderId}/complete`);
        return data;
    }
}


export const admin = {
    updateSettings: async (settings: { commissionRate: number, baseDeliveryFee: number }) => {
        if (USE_MOCK_DATA) {
            await delay(800);
            return { success: true, settings };
        }
        const token = localStorage.getItem('token');
        const { data } = await api.put('/admin/settings', settings, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    }
};

export default api;
