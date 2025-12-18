import React, { useState } from 'react';
import { FoodItem, Order, CartItem, Restaurant } from '../../types';
import Feed from './Feed';
import Cart from './Cart';
import CheckoutScreen from './CheckoutScreen';
import OrdersView from './OrdersView';
import CraveList from './CraveList';
import FoodDetailModal from './FoodDetailModal';
import { Home, Search, ShoppingBag, User as UserIcon, MapPin, ChevronDown, Heart, Wallet, ChevronRight, ChevronLeft } from 'lucide-react';
import WalletScreen from './WalletScreen';
import SettingsScreen from './SettingsScreen';

interface CustomerAppProps {
  orders: Order[];
  restaurants: Restaurant[];
  onPlaceOrder: (items: { item: FoodItem; quantity: number }[], paymentMethod: 'FULL_PREPAID' | 'PARTIAL_COURIER', deliveryFee: number, isTransfer: boolean, fulfillmentType: 'DELIVERY' | 'PICKUP', locationStr: string, coordinates?: { lat: number; lng: number }) => void;
  onLogout: () => void;
}



// Inline Logo Component
const CravioLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 15h18" />
    <path d="M5 15c0 2.5 3 5 7 5s7-2.5 7-5" />
    <path d="M6 15c0-3 2.5-5 6-5s6 2 6 5" />
    <path d="M12 3v7" />
    <path d="M8 6v4" />
    <path d="M16 6v4" />
  </svg>
);

export default function CustomerApp({ orders, restaurants, onPlaceOrder, onLogout }: CustomerAppProps) {
  const [activeTab, setActiveTab] = useState<'HOME' | 'SEARCH' | 'SAVED' | 'ORDERS' | 'PROFILE' | 'WALLET' | 'SETTINGS'>('HOME');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fulfillmentType, setFulfillmentType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');

  // App State
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false); // Modal cart logic
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Checkout modal logic
  const [location, setLocation] = useState("Victoria Island, Lagos");

  // Phase 2 State: Social & Detail Modal
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);

  // Actions
  const addToCart = (
    baseItem: FoodItem,
    quantity: number = 1,
    customization?: { text: string; price: number; variantId: string }
  ) => {

    // Generate a unique ID for this line item based on options
    const variantSuffix = customization ? customization.variantId : 'default';
    const cartId = `${baseItem.id}-${variantSuffix}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(i => i.cartId === cartId);

      if (existingIndex >= 0) {
        // Update quantity if exact variant exists
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      // Create a snapshot for the cart
      const itemSnapshot: FoodItem = {
        ...baseItem,
        price: customization ? customization.price : baseItem.price,
        customization: customization ? customization.text : undefined
      };

      return [...prev, { cartId, item: itemSnapshot, quantity }];
    });
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.cartId === cartId) return { ...i, quantity: Math.max(0, i.quantity + delta) };
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleFinalizeOrder = (notes: string, paymentMethod: 'FULL_PREPAID' | 'PARTIAL_COURIER', isTransfer: boolean) => {
    onPlaceOrder(
      cart.map(c => ({ item: c.item, quantity: c.quantity })),
      paymentMethod,
      fulfillmentType === 'PICKUP' ? 0 : 1500.00,
      isTransfer,
      fulfillmentType,
      location,
      deliveryCoordinates
    );
    setCart([]);
    setIsCheckoutOpen(false);
    setActiveTab('ORDERS');
  };

  const [deliveryCoordinates, setDeliveryCoordinates] = useState<{ lat: number; lng: number } | undefined>();

  const handleLocationChange = (newAddress: string, lat?: number, lng?: number) => {
    setLocation(newAddress);
    if (lat && lng) {
      setDeliveryCoordinates({ lat, lng });
    }
  };

  const toggleSaveItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setSavedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const cartTotalItems = cart.reduce((a, b) => a + b.quantity, 0);

  // Financial calculations
  const subtotal = cart.reduce((acc, { item, quantity }) => acc + item.price * quantity, 0);
  const deliveryFee = fulfillmentType === 'PICKUP' ? 0 : 1500.00;
  const taxRate = 0.075;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="h-full flex flex-col bg-white max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">

      {/* Header - Conditional Rendering */}
      {!isCartOpen && !isCheckoutOpen && activeTab !== 'PROFILE' && (
        <div className="bg-white sticky top-0 z-20 pt-12 pb-2 px-4 shadow-sm border-b border-gray-50">

          {/* Location & Cart Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-1.5 rounded-lg">
                <CravioLogo className="text-orange-600 w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Delivering to</span>
                <div
                  className="flex items-center gap-1 text-gray-900 font-bold cursor-pointer hover:text-orange-600 transition-colors"
                  onClick={handleLocationChange}
                >
                  <span>{location}</span>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition"
            >
              <ShoppingBag className="text-gray-800" size={20} />
              {cartTotalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar - Only on Home/Search */}
          {(activeTab === 'HOME' || activeTab === 'SEARCH') && (
            <div className="relative pb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 mb-1" size={16} />
              <input
                type="text"
                placeholder="Search dishes, restaurants..."
                className="w-full bg-gray-100 text-gray-800 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all border border-transparent focus:border-orange-200"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab === 'HOME') setActiveTab('SEARCH');
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">

        {isCartOpen ? (
          <div className="h-full bg-white">
            <div className="p-4 flex items-center gap-2 border-b border-gray-100">
              <button onClick={() => setIsCartOpen(false)} className="font-bold text-sm text-gray-500">Close</button>
            </div>
            <Cart
              items={cart}
              onUpdateQuantity={updateCartQuantity}
              onCheckout={handleProceedToCheckout}
              isPlacingOrder={false}
              location={location}
              onLocationChange={() => { }}
              fulfillmentType={fulfillmentType}
              setFulfillmentType={setFulfillmentType}
            />
          </div>
        ) : isCheckoutOpen ? (
          <CheckoutScreen
            items={cart}
            subtotal={subtotal}
            tax={tax}
            deliveryFee={deliveryFee}
            total={total}
            location={location}
            fulfillmentType={fulfillmentType}
            onBack={() => setIsCheckoutOpen(false)}
            onPlaceOrder={(notes, paymentMethod, isTransfer) => handleFinalizeOrder(notes, paymentMethod, isTransfer)}
            onLocationChange={handleLocationChange}
          />
        ) : (
          <>
            {(activeTab === 'HOME' || activeTab === 'SEARCH') && (
              <Feed
                onAddToCart={addToCart}
                searchQuery={activeTab === 'SEARCH' ? searchQuery : ""}
                locationName={location}
                onItemSelect={setSelectedFoodItem}
                savedItemIds={savedItemIds}
                onToggleSave={toggleSaveItem}
                restaurants={restaurants}
              />
            )}
            {activeTab === 'SAVED' && (
              <CraveList
                savedItemIds={savedItemIds}
                onItemSelect={setSelectedFoodItem}
                onToggleSave={toggleSaveItem}
              />
            )}
            {activeTab === 'ORDERS' && (
              <OrdersView orders={orders.filter(o => o.customerId === 'current_user')} />
            )}
            {activeTab === 'PROFILE' && (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Profile</h1>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div>
                    <h3 className="font-bold text-lg">John Doe</h3>
                    <p className="text-gray-500">Customer</p>
                  </div>
                </div>

                {/* Profile Menu */}
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => { setActiveTab('WALLET') }} // We'll add this tab state
                    className="w-full bg-orange-50 p-4 rounded-xl flex items-center justify-between border border-orange-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <Wallet size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">My Wallet</p>
                        <p className="text-xs text-gray-500 font-medium">Balance: ₦15,000</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>

                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('SETTINGS')}>
                      <span className="text-sm font-bold text-gray-700">Settings</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                      <span className="text-sm font-bold text-gray-700">Support</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full py-3 border border-gray-300 rounded-xl text-gray-600 font-semibold hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Wallet Screen Integration */}
            {/* Wallet Screen Integration */}
            {activeTab === 'WALLET' && (
              <div className="h-full">
                <div className="bg-white p-4 flex items-center gap-2 sticky top-0 z-10">
                  <button onClick={() => setActiveTab('PROFILE')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} />
                  </button>
                  <span className="font-bold text-lg">Back to Profile</span>
                </div>
                <WalletScreen />
              </div>
            )}

            {activeTab === 'SETTINGS' && (
              <SettingsScreen onBack={() => setActiveTab('PROFILE')} />
            )}
          </>
        )}
      </div>

      {/* Global Food Detail Modal */}
      {
        selectedFoodItem && (
          <FoodDetailModal
            item={selectedFoodItem}
            onClose={() => setSelectedFoodItem(null)}
            onAddToCart={addToCart}
          />
        )
      }

      {/* Bottom Navigation */}
      {
        !isCartOpen && !isCheckoutOpen && (
          <div className="bg-white border-t border-gray-100 flex justify-around py-3 pb-6 sticky bottom-0 z-30 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
            <button onClick={() => setActiveTab('HOME')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'HOME' ? 'text-orange-600' : 'text-gray-400'}`}>
              <Home size={24} strokeWidth={activeTab === 'HOME' ? 3 : 2} />
              <span className="text-[10px] font-medium">Discover</span>
            </button>
            <button onClick={() => setActiveTab('SEARCH')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'SEARCH' ? 'text-orange-600' : 'text-gray-400'}`}>
              <Search size={24} strokeWidth={activeTab === 'SEARCH' ? 3 : 2} />
              <span className="text-[10px] font-medium">Search</span>
            </button>
            <button onClick={() => setActiveTab('SAVED')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'SAVED' ? 'text-orange-600' : 'text-gray-400'}`}>
              <Heart size={24} fill={activeTab === 'SAVED' ? "currentColor" : "none"} strokeWidth={activeTab === 'SAVED' ? 0 : 2} />
              <span className="text-[10px] font-medium">Saved</span>
            </button>
            <button onClick={() => setActiveTab('ORDERS')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'ORDERS' ? 'text-orange-600' : 'text-gray-400'}`}>
              <ShoppingBag size={24} strokeWidth={activeTab === 'ORDERS' ? 3 : 2} />
              <span className="text-[10px] font-medium">Orders</span>
            </button>
            <button onClick={() => setActiveTab('PROFILE')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'PROFILE' ? 'text-orange-600' : 'text-gray-400'}`}>
              <UserIcon size={24} strokeWidth={activeTab === 'PROFILE' ? 3 : 2} />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </div>
        )
      }
    </div >
  );
}