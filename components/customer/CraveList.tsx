import React from 'react';
import { FoodItem } from '../../types';
import { FOOD_ITEMS, RESTAURANTS } from '../../constants';
import { Heart, SearchX, ShoppingBag, Plus } from 'lucide-react';

interface CraveListProps {
  savedItemIds: Set<string>;
  onItemSelect: (item: FoodItem) => void;
  onToggleSave: (e: React.MouseEvent, itemId: string) => void;
}

const CraveList: React.FC<CraveListProps> = ({ savedItemIds, onItemSelect, onToggleSave }) => {
  const savedItems = FOOD_ITEMS.filter(item => savedItemIds.has(item.id));

  const getRestaurant = (id: string) => RESTAURANTS.find(r => r.id === id);

  if (savedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-3/4 p-8 text-center text-gray-400">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Heart size={48} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Crave List is empty</h2>
        <p className="mt-2 text-sm max-w-xs">Save delicious items you want to try later by tapping the heart icon on any meal.</p>
        <button className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm">
            Start Exploring
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 p-4">
      <h1 className="text-2xl font-bold mb-1">Crave List</h1>
      <p className="text-gray-500 text-sm mb-6">Your personal collection of must-haves.</p>

      <div className="grid grid-cols-2 gap-4">
        {savedItems.map(item => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => onItemSelect(item)}
          >
            <div className="relative aspect-square bg-gray-100">
                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                
                <button 
                    onClick={(e) => onToggleSave(e, item.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:scale-110 transition-transform shadow-sm"
                >
                    <Heart size={16} fill="currentColor" />
                </button>
            </div>
            
            <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 truncate">{getRestaurant(item.restaurantId)?.name}</p>
                </div>
                
                <div className="flex justify-between items-center mt-auto">
                     <span className="font-bold text-sm text-gray-900">₦{item.price.toLocaleString()}</span>
                     <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                         <Plus size={14} />
                     </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CraveList;