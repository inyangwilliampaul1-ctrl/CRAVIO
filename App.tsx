import React, { useState, useEffect } from 'react';
import { UserRole, FoodItem, Order, OrderStatus, Restaurant } from './types';
import AuthScreen from './components/AuthScreen';
import CustomerApp from './components/customer/CustomerApp';
import VendorDashboard from './components/vendor/VendorDashboard';
import RiderDashboard from './components/rider/RiderDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { auth, customer, vendor, courier } from './services/api';


import mockDataRaw from './mock_data.json';

// Helper to map JSON vendors to Restaurant interface & Items
const mapSeedDataToState = () => {
  const vendors: Restaurant[] = mockDataRaw.vendors.map((v: any) => {
    let imageUrl = "https://placehold.co/100x100?text=Logo";
    if (v.id === 'd90acfb6-0b44-4d9c-bf92-e9e4eb035c15') imageUrl = "/assets/images/logo_peters_place.png";
    else if (v.id === '62534f93-74b8-424f-9fa2-553bf9c9862c') imageUrl = "/assets/images/logo_james_kitchen.png";
    else if (v.id === '9864a0ee-7cea-40f1-b53f-f29851d9a23e') imageUrl = "/assets/images/logo_cornelius_bistro.png";

    // Map menu items with images
    const menuItems = v.menuItems?.map((item: any) => ({
      ...item,
      imageUrl: item.name.includes('Pepper Soup')
        ? "/assets/images/food_pepper_soup.png"
        : item.imageUrl || "https://placehold.co/400x300?text=Food"
    }));

    return {
      ...v,
      imageUrl,
      menuItems, // Ensure modified menu items are used if the component uses them from vendor object
      rating: v.rating || 4.5,
      isOpen: v.isOpen !== undefined ? v.isOpen : true,
      category: v.category || 'General',
      status: v.status as any
    };
  });

  const orders: Order[] = mockDataRaw.orders.map((o: any, index: number) => ({
    ...o,
    restaurantId: o.vendorId, // Map vendorId to restaurantId
    timestamp: new Date(o.createdAt).getTime(), // Convert string to timestamp
    items: [], // Seeded orders currently lack items in JSON, empty for now
    paymentMethod: index % 3 === 0 ? 'PARTIAL_COURIER' : 'FULL_PREPAID',
    amountDueOnDelivery: index % 3 === 0 ? (o.totalAmount || 5000) : 0,
    fulfillmentType: 'DELIVERY'
  }));

  return { vendors, orders };
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
          <div className="bg-red-50 p-4 rounded text-left overflow-auto max-w-2xl mx-auto border border-red-200">
            <p className="font-mono text-xs text-red-800 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Restaurant | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Load Seed Data on Mount
  useEffect(() => {
    try {
      const { vendors, orders: seedOrders } = mapSeedDataToState();
      setRestaurants(vendors);
      setOrders(seedOrders);
      console.log("Seeded data loaded:", vendors.length, "vendors", seedOrders.length, "orders");
    } catch (e) {
      console.error("Failed to load seed data", e);
    }
  }, []);

  // Polling Effect based on Role
  useEffect(() => {
    if (!currentRole) return;

    const fetchOrders = async () => {
      try {
        if (currentRole === 'VENDOR') {
          const data = await vendor.getOrders();
          // Mapper needed if backend shape differs from frontend types
          // Backend Order has `items`, `status`, etc.
          // Frontend expects: { id, customerId, restaurantId, items: [], totalAmount, status... }
          // We might need to map it.
          // For Verified Golden Path, assuming mostly compatible or I map here.
          setOrders(data);
        } else if (currentRole === 'RIDER') {
          const data = await courier.getAssignedOrders();
          setOrders(data);
        }
      } catch (e) {
        console.error("Polling Error:", e);
      }
    };

    fetchOrders(); // Initial call
    const interval = setInterval(fetchOrders, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [currentRole]);


  // Handlers
  const handleLogin = async (role: UserRole, email: string) => {
    // In real auth, AuthScreen handles the API call and passes role up?
    // Or we do it here.
    // AuthScreen currently mocks it. We need to intercept or pass a real login handler to AuthScreen.
    // Let's assume AuthScreen calls onLogin with role.
    // But we need the TOKEN.
    // So AuthScreen needs to be updated to use `api.auth.login`.
    // We'll update AuthScreen next. For now, assume it sets token and returns us the role.
    setCurrentRole(role);
    // Fetch profile if needed? backend handles role.
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setCurrentUserProfile(undefined);
    localStorage.removeItem('token');
  };

  const placeOrder = async (
    items: { item: FoodItem; quantity: number }[],
    paymentMethod: 'FULL_PREPAID' | 'PARTIAL_COURIER' = 'FULL_PREPAID',
    deliveryFee: number = 1000.00,
    isTransfer: boolean = false,
    fulfillmentType: 'DELIVERY' | 'PICKUP' = 'DELIVERY',
    locationStr: string = 'Lagos',
    coordinates?: { lat: number; lng: number }
  ) => {
    if (items.length === 0) return;

    // Construct Payload for Backend
    const backendItems = items.map(i => ({ menuItemId: i.item.id, quantity: i.quantity }));

    // Calculate Amount Due on Delivery
    // If PARTIAL_COURIER, the user pays the Delivery Fee in cash to the rider.
    // If FULL_PREPAID, they pay 0 on delivery.
    // If PICKUP, they pay 0 on delivery (and fee is likely 0).
    const amountDueOnDelivery = (fulfillmentType === 'DELIVERY' && paymentMethod === 'PARTIAL_COURIER')
      ? deliveryFee
      : 0;

    const payload = {
      vendorId: items[0].item.restaurantId,
      items: backendItems,
      paymentMethod: paymentMethod,
      amountDueOnDelivery, // Critical for Rider App
      fulfillmentType,
      deliveryAddress: locationStr,
      deliveryLat: coordinates?.lat || 6.45,
      deliveryLng: coordinates?.lng || 3.40
    };

    try {
      await customer.checkout(payload);
      alert("Order Placed Successfully!");
      // Refresh? Customer orders usually distinct from 'orders' state used by Vendor/Rider dashboards
    } catch (e) {
      console.error("Checkout Failed", e);
      alert("Checkout Failed");
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // Determine action based on status transition intent
    // Frontend 'status' is the target status
    try {
      if (currentRole === 'VENDOR') {
        // Use generic status update as requested
        await vendor.updateStatus(orderId, status);
      } else if (currentRole === 'RIDER') {
        if (status === 'DELIVERED') {
          await courier.completeOrder(orderId);
        } else {
          // Handle PICKED_UP, ON_WAY, etc.
          await courier.updateStatus(orderId, status);
        }
      }
      // Optimistic update or wait for poll? 
      // Wait for poll is safer.
    } catch (e) {
      console.error("Update Status Failed", e);
      alert("Action Failed");
    }
  };

  // Router Logic
  if (!currentRole) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <main className="h-screen w-full">
        {currentRole === 'CUSTOMER' && (
          <CustomerApp
            orders={[]} // Cust history not implemented in backend yet or polling
            restaurants={restaurants}
            onPlaceOrder={placeOrder}
            onLogout={handleLogout}
          />
        )}

        {currentRole === 'VENDOR' && (
          <div className="h-full flex flex-col">
            <div className="bg-white p-4 shadow-sm flex justify-between items-center">
              <span className="font-bold text-blue-600">Partner Portal</span>
              <button onClick={handleLogout} className="text-sm text-gray-500">Log Out</button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="flex-1 overflow-auto">
                <ErrorBoundary>
                  <VendorDashboard
                    orders={orders}
                    onUpdateStatus={updateOrderStatus}
                    vendorProfile={currentUserProfile}
                  />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'RIDER' && (
          <div className="h-full flex flex-col">
            <div className="bg-white p-4 shadow-sm flex justify-between items-center">
              <span className="font-bold text-green-600">Rider App</span>
              <button onClick={handleLogout} className="text-sm text-gray-500">Log Out</button>
            </div>
            <div className="flex-1 overflow-auto">
              <ErrorBoundary>
                <RiderDashboard orders={orders} onUpdateStatus={updateOrderStatus} />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {currentRole === 'ADMIN' && (
          <div className="h-full flex flex-col">
            <div className="bg-white p-4 shadow-sm flex justify-between items-center">
              <span className="font-bold text-gray-800">Admin Panel</span>
              <button onClick={handleLogout} className="text-sm text-gray-500">Log Out</button>
            </div>
            <div className="flex-1 overflow-auto">
              <AdminDashboard orders={orders} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}