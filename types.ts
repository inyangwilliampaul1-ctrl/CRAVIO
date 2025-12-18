export type UserRole = 'CUSTOMER' | 'VENDOR' | 'RIDER' | 'ADMIN';

export type OrderStatus =
  | 'PAYMENT_PENDING' // New status for Mobile Transfer verification
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'ON_WAY'
  | 'DELIVERED'
  | 'CANCELLED'; // Added for vendor rejection

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text?: string;
  mediaUrl?: string; // photo or video

  timestamp: number;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;

  calories?: number;
  prepTimeMinutes: number;
  customization?: string; // Added for order snapshots (e.g. "Large, No Onions")
  available?: boolean; // Inventory control
  category?: string; // Menu categorization (e.g. "Starters", "Mains")
  // Social Discovery Fields (Phase 2)
  likes: number;
  reviews: Review[];
}

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  imageUrl: string;
  address: string;
  category: string;
  isOpen: boolean;
  // Verification Fields
  status: VendorStatus;
  businessRegNo?: string; // BN or RC Number
  bvn?: string; // Bank Verification Number
  bankDetails?: string;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: { item: FoodItem; quantity: number }[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  riderId?: string;
  deliveryFee: number;
  // New Payment Fields
  paymentMethod: 'FULL_PREPAID' | 'PARTIAL_COURIER';
  amountDueOnDelivery: number; // 0 if prepaid, otherwise equals deliveryFee
  // Logistics
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryAddress?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  restaurantId?: string; // Links vendor user to restaurant
}

// For Analytics
export interface DailyStat {
  day: string;
  orders: number;
  revenue: number;
}

// Cart Item definition
export interface CartItem {
  cartId: string; // Unique ID (itemId + variantHash)
  item: FoodItem; // Snapshot of the item with correct price/description
  quantity: number;
}