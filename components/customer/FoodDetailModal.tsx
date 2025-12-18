import React, { useState } from 'react';
import { FoodItem } from '../../types';
import { RESTAURANTS } from '../../constants';
import { ChevronLeft, Star, Clock, Minus, Plus, Play, User } from 'lucide-react';

interface FoodDetailModalProps {
  item: FoodItem;
  onClose: () => void;
  onAddToCart: (item: FoodItem, quantity: number, customization?: { text: string; price: number; variantId: string }) => void;
}

// Mock Data for Options
const MOCK_OPTIONS = {
    sizes: [
        { id: 'REG', name: 'Regular', price: 0 },
        { id: 'LRG', name: 'Large', price: 1500 },
    ],
    addons: [
        { id: 'CHEESE', name: 'Extra Cheese', price: 1000 },
        { id: 'PROTEIN', name: 'Extra Meat/Fish', price: 2000 },
        { id: 'DRINK', name: 'Soft Drink', price: 800 },
    ]
};

const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('REG');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const getRestaurant = (id: string) => RESTAURANTS.find(r => r.id === id);

  const calculateTotal = () => {
      const basePrice = item.price;
      const sizePrice = MOCK_OPTIONS.sizes.find(s => s.id === selectedSize)?.price || 0;
      const addonsPrice = Array.from(selectedAddons).reduce<number>((sum, id) => {
          const addon = MOCK_OPTIONS.addons.find(a => a.id === id);
          return sum + (addon ? addon.price : 0);
      }, 0);
      return (basePrice + sizePrice + addonsPrice) * quantity;
  };

  const toggleAddon = (id: string) => {
      const newSet = new Set(selectedAddons);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedAddons(newSet);
  };

  const handleAddToCart = () => {
      const sizeObj = MOCK_OPTIONS.sizes.find(s => s.id === selectedSize);
      const addonObjs = Array.from(selectedAddons).map(id => MOCK_OPTIONS.addons.find(a => a.id === id));
      
      const parts = [];
      if (sizeObj && sizeObj.id !== 'REG') parts.push(sizeObj.name);
      addonObjs.forEach(a => { if (a) parts.push(a.name) });
      const customizationText = parts.join(', ');

      const unitPrice = calculateTotal() / quantity;
      const variantId = [selectedSize, ...Array.from(selectedAddons).sort()].join('-');
      
      onAddToCart(item, quantity, {
          text: customizationText,
          price: unitPrice,
          variantId: variantId || 'default'
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white w-full h-full sm:h-[90vh] sm:max-w-md sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* HERO IMAGE */}
            <div className="relative h-64 sm:h-72 shrink-0 group">
                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                
                {/* Close Button */}
                <button 
                  onClick={onClose}
                  className="absolute top-4 left-4 bg-white/90 text-gray-900 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 -mt-6 relative z-10 no-scrollbar">
                
                {/* Header Info */}
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{item.name}</h2>
                  <span className="text-xl font-bold text-gray-900">₦{(calculateTotal() / quantity).toLocaleString()}</span>
                </div>
                
                {/* Restaurant Context */}
                <div className="flex items-center gap-2 mb-6 text-sm">
                    <span className="font-semibold text-gray-900">{getRestaurant(item.restaurantId)?.name}</span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1 text-yellow-600 font-bold">
                       <Star size={12} fill="currentColor" /> {getRestaurant(item.restaurantId)?.rating}
                    </span>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={12} />
                        <span>{item.prepTimeMinutes + 10}-{item.prepTimeMinutes + 20} min</span>
                    </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                    {item.description}
                </p>

                {/* --- COMMUNITY CRAVINGS (Phase 2 Feature) --- */}
                <div className="mb-8">
                     <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                         Community Cravings
                         <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{item.reviews.length}</span>
                     </h3>
                     
                     {item.reviews.length > 0 ? (
                         <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                             {item.reviews.map(review => (
                                 <div key={review.id} className="min-w-[140px] bg-gray-50 rounded-xl p-2 border border-gray-100">
                                     {review.mediaUrl ? (
                                         <div className="relative h-24 rounded-lg overflow-hidden mb-2 bg-gray-200">
                                             <img src={review.mediaUrl} className="w-full h-full object-cover" alt="Review" />
                                             {/* Video Indicator overlay */}
                                             <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                 <Play size={20} fill="white" className="text-white drop-shadow-md opacity-80" />
                                             </div>
                                         </div>
                                     ) : (
                                        <div className="h-24 rounded-lg bg-gray-200 mb-2 flex items-center justify-center text-gray-400 text-xs text-center px-2">
                                            No Image
                                        </div>
                                     )}
                                     <div className="flex items-center gap-2 mb-1">
                                         <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-[10px] font-bold text-orange-800">
                                             {review.userName.charAt(0)}
                                         </div>
                                         <span className="text-xs font-bold text-gray-900 truncate">{review.userName}</span>
                                     </div>
                                     <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">"{review.text}"</p>
                                 </div>
                             ))}
                             {/* Add Review Placeholder */}
                             <div className="min-w-[100px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 gap-1 cursor-pointer hover:bg-gray-100 transition-colors">
                                 <Plus size={24} />
                                 <span className="text-[10px] font-bold">Add Yours</span>
                             </div>
                         </div>
                     ) : (
                         <div className="bg-gray-50 rounded-xl p-4 text-center border border-dashed border-gray-200">
                             <p className="text-sm text-gray-400">Be the first to share a video review!</p>
                             <button className="text-orange-600 text-xs font-bold mt-2">Upload Video</button>
                         </div>
                     )}
                </div>

                <hr className="border-gray-100 mb-8" />

                {/* Customization: Size */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Size</h3>
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Required</span>
                    </div>
                    <div className="space-y-3">
                        {MOCK_OPTIONS.sizes.map(size => (
                            <label key={size.id} className="flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 active:scale-[0.99] border-gray-200 has-[:checked]:border-orange-50">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex items-center">
                                        <input 
                                          type="radio" 
                                          name="size" 
                                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-orange-500 checked:bg-orange-500 transition-colors"
                                          checked={selectedSize === size.id}
                                          onChange={() => setSelectedSize(size.id)}
                                        />
                                        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                                    </div>
                                    <span className="font-medium text-gray-900">{size.name}</span>
                                </div>
                                {size.price > 0 && <span className="text-gray-500 text-sm">+₦{size.price.toLocaleString()}</span>}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Customization: Add-ons */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Add-ons</h3>
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">Optional</span>
                    </div>
                    <div className="space-y-3">
                        {MOCK_OPTIONS.addons.map(addon => (
                            <label key={addon.id} className="flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 active:scale-[0.99] border-gray-200 has-[:checked]:border-orange-50">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex items-center">
                                        <input 
                                          type="checkbox" 
                                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded checked:border-orange-500 checked:bg-orange-500 transition-colors"
                                          checked={selectedAddons.has(addon.id)}
                                          onChange={() => toggleAddon(addon.id)}
                                        />
                                        <div className="absolute inset-0 m-auto flex items-center justify-center opacity-0 peer-checked:opacity-100 pointer-events-none text-white">
                                            <Plus size={14} strokeWidth={4} />
                                        </div>
                                    </div>
                                    <span className="font-medium text-gray-900">{addon.name}</span>
                                </div>
                                <span className="text-gray-500 text-sm">
                                    {addon.price > 0 ? `+₦${addon.price.toLocaleString()}` : 'Free'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4">
                    <span className="font-bold text-gray-900">Quantity</span>
                    <div className="flex items-center gap-6 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className={`p-1 rounded-full ${quantity === 1 ? 'text-gray-300' : 'text-gray-900 hover:bg-gray-100'}`}
                          disabled={quantity <= 1}
                        >
                            <Minus size={20} />
                        </button>
                        <span className="font-bold text-xl w-6 text-center">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-1 rounded-full text-gray-900 hover:bg-gray-100"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    Add to Order • ₦{calculateTotal().toLocaleString()}
                </button>
            </div>
        </div>
    </div>
  );
};

export default FoodDetailModal;