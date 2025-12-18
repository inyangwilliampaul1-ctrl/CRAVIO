import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Users, MapPin, PersonStanding, Edit2, Store } from 'lucide-react';
import { CartItem } from '../../types';
import { RESTAURANTS } from '../../constants';
import GroupOrderModal from './GroupOrderModal';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onCheckout: (fulfillmentType: 'DELIVERY' | 'PICKUP') => void;
  isPlacingOrder: boolean;
  location: string;
  onLocationChange?: () => void;
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  setFulfillmentType: (type: 'DELIVERY' | 'PICKUP') => void;
}

export default function Cart({
  items,
  onUpdateQuantity,
  onCheckout,
  isPlacingOrder,
  location,
  onLocationChange,
  fulfillmentType,
  setFulfillmentType
}: CartProps) {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isGroupActive, setIsGroupActive] = useState(false);

  // Calculate financials
  const subtotal = items.reduce((acc, { item, quantity }) => acc + item.price * quantity, 0);
  // Delivery Fee is 0 if Pickup
  const deliveryFee = fulfillmentType === 'PICKUP' ? 0 : 1500.00;
  const taxRate = 0.075; // 7.5% VAT in Nigeria
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  // Derive restaurant context from the first item (Assuming single-restaurant cart for MVP)
  const restaurant = items.length > 0
    ? RESTAURANTS.find(r => r.id === items[0].item.restaurantId)
    : null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. Fulfillment Toggle & Context */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 space-y-3">

        {/* Toggle */}
        <div className="bg-gray-100 p-1 rounded-xl flex font-bold text-sm">
          <button
            onClick={() => setFulfillmentType('DELIVERY')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${fulfillmentType === 'DELIVERY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            <MapPin size={16} /> Delivery
          </button>
          <button
            onClick={() => setFulfillmentType('PICKUP')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${fulfillmentType === 'PICKUP' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            <PersonStanding size={16} /> Pickup
          </button>
        </div>

        <div>
          <h1 className="text-lg font-bold text-gray-900 mb-1 leading-none">
            {restaurant ? restaurant.name : 'Your Order'}
          </h1>

          {fulfillmentType === 'DELIVERY' ? (
            <div
              onClick={onLocationChange}
              className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer hover:text-orange-600 transition-colors"
            >
              <MapPin size={12} className="text-orange-600" />
              <span className="truncate max-w-[250px]">To: {location}</span>
              <Edit2 size={10} className="opacity-50" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded">
              <Store size={12} />
              <span>Pickup at Restaurant</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Scrollable Item List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {items.map(({ cartId, item, quantity }) => (
          <div key={cartId} className="flex gap-4">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100 shadow-sm" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                  <span className="font-semibold text-gray-900">₦{(item.price * quantity).toLocaleString()}</span>
                </div>

                {/* Display Specific Customization or Default Description */}
                {item.customization ? (
                  <p className="text-xs text-orange-700 font-medium mt-1">
                    {item.customization}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => onUpdateQuantity(cartId, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(cartId, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-gray-100"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Remove Button - Explicit and Red */}
                <button
                  onClick={() => onUpdateQuantity(cartId, -quantity)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Pricing Breakdown & Checkout */}
      <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">

        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-500">{fulfillmentType === 'PICKUP' ? 'Pickup' : 'Delivery Fee'}</span>
          <span className="font-medium">{deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}</span>
        </div>
        <div className="flex justify-between mb-4 text-xl font-bold">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>

        <button
          onClick={() => onCheckout(fulfillmentType)}
          disabled={isPlacingOrder}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex justify-center items-center transition-all active:scale-[0.98] ${isPlacingOrder ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
            }`}
        >
          {isPlacingOrder ? 'Processing...' : `Checkout (${fulfillmentType})`}
        </button>
      </div>
    </div>
  );
};