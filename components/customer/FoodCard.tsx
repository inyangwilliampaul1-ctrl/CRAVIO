import React from 'react';
import { FoodItem } from '../../types';
import { Heart, Clock, Plus, Sparkles } from 'lucide-react';

interface FoodCardProps {
    item: FoodItem & { restaurantName?: string; restaurantImage?: string; rating?: number; category?: string };
    onSelect: () => void;
    onToggleSave: (e: React.MouseEvent) => void;
    isSaved: boolean;
    onQuickAdd: (e: React.MouseEvent) => void;
    formatLikes: (count: number) => string;
}

const FoodCard: React.FC<FoodCardProps> = ({
    item,
    onSelect,
    onToggleSave,
    isSaved,
    onQuickAdd,
    formatLikes
}) => {
    return (
        <div className="bg-white border-b border-gray-100 pb-8 last:border-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-3">
                <div className="flex items-center gap-2">
                    <img src={item.restaurantImage} className="w-9 h-9 rounded-full object-cover border border-gray-100 shadow-sm" alt="" />
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{item.restaurantName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                                <Sparkles size={10} fill="currentColor" /> {item.rating}
                            </span>
                            <span>• {item.category}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-1.5">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">{item.prepTimeMinutes + 15}m</span>
                </div>
            </div>

            {/* Media Container */}
            <div
                className="relative w-full bg-gray-100 cursor-pointer active:opacity-95 transition-opacity"
                onClick={onSelect}
            >
                <div className="relative aspect-[4/5] sm:aspect-square md:aspect-[16/9] overflow-hidden">
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none"></div>

                    {/* Social Actions */}
                    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-20">
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={onToggleSave}
                                className={`p-3 rounded-full backdrop-blur-sm transition-transform active:scale-90 ${isSaved ? 'bg-white/90 text-red-500' : 'bg-black/30 text-white hover:bg-black/50'}`}
                            >
                                <Heart size={24} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
                            </button>
                            <span className="text-white text-xs font-bold shadow-sm">{formatLikes(item.likes)}</span>
                        </div>
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-4 left-4 z-20">
                        <h3 className="text-white font-bold text-xl shadow-sm">{item.name}</h3>
                        <p className="text-gray-200 text-sm line-clamp-1 opacity-90">{item.description}</p>
                    </div>

                    {/* Quick Add */}
                    <div className="absolute bottom-4 right-4 z-20">
                        <button
                            onClick={onQuickAdd}
                            className="bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-1 active:scale-90 transition-transform hover:bg-gray-100"
                        >
                            <span>₦{item.price.toLocaleString()}</span>
                            <Plus size={16} className="bg-black text-white rounded-full p-0.5 ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodCard;
