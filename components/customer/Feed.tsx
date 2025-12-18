import React, { useState, useEffect } from 'react';
import { FoodItem, Restaurant } from '../../types';
// import { FOOD_ITEMS, RESTAURANTS } from '../../constants'; // Removed mock
import { Heart, Star, Clock, Plus, Sparkles, SearchX, MapPin, X } from 'lucide-react';
import { generateDishDescription } from '../../services/geminiService';
import FoodCard from './FoodCard';

interface FeedProps {
    onAddToCart: (item: FoodItem, quantity: number, customization?: { text: string; price: number; variantId: string }) => void;
    searchQuery?: string;
    locationName?: string;
    onItemSelect: (item: FoodItem) => void; // Lifted state
    savedItemIds: Set<string>;
    onToggleSave: (e: React.MouseEvent, itemId: string) => void;
    restaurants?: Restaurant[];
}

const Feed: React.FC<FeedProps> = ({
    onAddToCart,
    searchQuery = "",
    locationName = "Lagos",
    onItemSelect,
    savedItemIds,
    onToggleSave,
    restaurants: propRestaurants
}) => {
    const [items, setItems] = useState<FoodItem[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    const [aiCaption, setAiCaption] = useState<string>("");
    const [featuredItem, setFeaturedItem] = useState<FoodItem | null>(null);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

    const [buyAgainItems, setBuyAgainItems] = useState<FoodItem[]>([]);

    useEffect(() => {
        // If restaurants passed via props (from Seed Data), use them!
        if (propRestaurants && propRestaurants.length > 0) {
            setRestaurants(propRestaurants);

            // Extract all items from these restaurants to build the feed
            // Assuming restaurants have a 'menuItems' property from the JSON mapping
            // But 'Restaurant' interface might not have 'menuItems' yet?
            // Let's check Restaurant interface in types.ts.
            // If it's missing, we need to cast or fix types. 
            // The JSON logic in App.tsx didn't attach items to vendors? 
            // Wait, "items" in App.tsx logic for orders had items. 
            // I need to ensure Restaurants have items attached or I need to fetch items separately.

            // Actually, for the Feed, we want a list of ALL items. 
            // Since we don't have a separate item list passed as prop, we might rely on the internal fetch OR
            // Expect 'restaurants' to contain the items.

            // Let's rely on the internal fetch logic BUT if propRestaurants is provided, we prefer that for the Vendorf list.
            // However, to fix "Blank Page" quickly, let's assume the internal fetch fails or returns empty?
            // The internal fetch calls `api.customer.getFeed()` which uses MOCK data inside `api.ts`.

            // WE WANT TO SHOW THE SEED DATA.
            // We passed 'restaurants' to Feed.
            // We should use it.

            // Assuming the `restaurants` prop contains the seed data vendors.
            // But where are the ITEMS?
            // `App.tsx` logic: `const { vendors, orders } = mapSeedDataToState();`
            // `vendors` are passed to `restaurants`.
            // We need to pass `items` to Feed too if we want to show food items!

            // Let's fix this properly in next tool call: Pass `items` to Feed as well?
            // OR extract items from `propRestaurants` if we attached them.
            // In `App.tsx`: `vendors` map does NOT explicitly attach `menuItems` property in the return object 
            // unless `...v` includes it. `mock_data.json` vendors DO have `menuItems`.
            // So `propRestaurants` elements DO have `menuItems` (as arbitrary props because Typescript interface might strip them if strict, but at runtime they exist).

            // Let's try to extract them.

            const allItems: FoodItem[] = [];
            propRestaurants.forEach((r: any) => {
                if (r.menuItems && Array.isArray(r.menuItems)) {
                    r.menuItems.forEach((i: any) => {
                        allItems.push({
                            ...i,
                            restaurantId: r.id,
                            imageUrl: i.imageUrl || "https://placehold.co/400x300?text=Food", // Ensure image
                            price: typeof i.price === 'string' ? parseFloat(i.price) : i.price,
                            rating: i.rating || 4.5,
                            likes: i.likes || 10,
                            prepTimeMinutes: i.prepTimeMinutes || 20,
                            reviews: [] // Default
                        });
                    });
                }
            });

            setItems(allItems);
            setLoading(false);
            return;
        }

        const fetchFeed = async () => {
            try {
                const apiModule = await import('../../services/api');
                const feedData = await apiModule.customer.getFeed();

                if (!feedData || !Array.isArray(feedData)) {
                    console.error("Feed API Error: Expected array, got", feedData);
                    setLoading(false);
                    return;
                }

                const loadedRestaurants: Restaurant[] = feedData.map((v: any) => ({
                    id: v.userId || v.id,
                    name: v.name,
                    imageUrl: 'https://picsum.photos/200',
                    rating: 4.8,
                    category: 'General',
                    isOpen: v.isOpen,
                    address: 'Lagos',
                    status: 'APPROVED'
                }));

                const loadedItems: FoodItem[] = [];
                feedData.forEach((v: any) => {
                    if (v.menuItems && Array.isArray(v.menuItems)) {
                        v.menuItems.forEach((i: any) => {
                            loadedItems.push({
                                id: i.id,
                                restaurantId: v.id,
                                name: i.name,
                                description: i.description,
                                price: typeof i.price === 'string' ? parseFloat(i.price) : i.price,
                                imageUrl: i.imageUrl || 'https://picsum.photos/400',
                                category: i.category,
                                isVegetarian: i.isVegetarian,
                                isSpicy: i.isSpicy,
                                likes: 42,
                                prepTimeMinutes: 20
                            });
                        });
                    }
                });

                setRestaurants(loadedRestaurants);
                setItems(loadedItems);

                if (loadedItems.length > 0) {
                    const random = loadedItems[Math.floor(Math.random() * loadedItems.length)];
                    setFeaturedItem(random);
                }

                // Mock Buy Again Data
                const mockBuyAgain = loadedItems.slice(0, 5);
                setBuyAgainItems(mockBuyAgain);

                setLoading(false);
            } catch (e) {
                console.error("Feed Fetch Error", e);
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const getRestaurant = (id: string) => restaurants.find(r => r.id === id);

    const filteredItems = items.filter(item => {
        if (selectedRestaurantId && item.restaurantId !== selectedRestaurantId) return false;
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        const restaurant = getRestaurant(item.restaurantId);
        return (
            item.name.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            (restaurant && restaurant.name.toLowerCase().includes(lowerQuery))
        );
    });

    const isSearching = !!searchQuery;

    const handleQuickAdd = (e: React.MouseEvent, item: FoodItem) => {
        e.stopPropagation();
        onAddToCart(item, 1);
    };

    const handleRestaurantClick = (id: string) => {
        if (selectedRestaurantId === id) {
            setSelectedRestaurantId(null);
        } else {
            setSelectedRestaurantId(id);
        }
    };

    // Helper to format large like counts
    const formatLikes = (count: number) => {
        if (!count) return '0';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
        return count.toString();
    };

    return (
        <div className="pb-24 relative">

            {/* Buy It Again Section */}
            {!isSearching && buyAgainItems.length > 0 && (
                <div className="pt-4 px-4">
                    <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock size={16} className="text-orange-600" /> Buy It Again
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {buyAgainItems.map((item) => (
                            <div
                                key={item.id}
                                className="min-w-[140px] w-[140px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-shrink-0 cursor-pointer"
                                onClick={() => onItemSelect(item)}
                            >
                                <div className="h-24 bg-gray-100 relative">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    <button
                                        onClick={(e) => handleQuickAdd(e, item)}
                                        className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md text-orange-600 hover:bg-orange-50"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                                <div className="p-2">
                                    <h3 className="font-bold text-xs text-gray-900 truncate">{item.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium">₦{item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Restaurant Selection Row */}
            {!isSearching && (
                <>
                    <div className="p-4 pt-2 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Discover</h1>
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                <MapPin size={12} className="text-orange-600" />
                                Popular near {locationName.split(',')[0]}
                            </p>
                        </div>
                        {!selectedRestaurantId && (
                            <button className="text-xs font-bold text-orange-600 hover:text-orange-700">See all</button>
                        )}
                    </div>

                    {selectedRestaurantId ? (
                        <div className="px-4 pb-4 flex items-center gap-2">
                            <button
                                onClick={() => setSelectedRestaurantId(null)}
                                className="bg-gray-200 p-1 rounded-full"
                            >
                                <X size={16} />
                            </button>
                            <span className="font-bold text-lg">
                                {getRestaurant(selectedRestaurantId)?.name}
                            </span>
                            <span className="text-sm text-gray-500">Menu</span>
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto px-4 pb-6 no-scrollbar">
                            {restaurants.map(rest => (
                                <div
                                    key={rest.id}
                                    onClick={() => handleRestaurantClick(rest.id)}
                                    className="flex flex-col items-center space-y-2 min-w-[72px] cursor-pointer group"
                                >
                                    <div className={`w-16 h-16 rounded-full p-0.5 transition-all ${selectedRestaurantId === rest.id ? 'bg-orange-600 scale-110' : 'bg-gradient-to-tr from-orange-500 to-purple-600 hover:scale-105'}`}>
                                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                                            <img src={rest.imageUrl} alt={rest.name} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium truncate w-full text-center ${selectedRestaurantId === rest.id ? 'text-orange-600 font-bold' : ''}`}>
                                        {rest.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Food Feed */}
            <div className={`space-y-2 ${isSearching ? 'pt-4' : ''}`}>
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <SearchX size={48} className="mb-2 opacity-50" />
                        <p>No delicious matches found.</p>
                        {selectedRestaurantId && (
                            <button
                                onClick={() => setSelectedRestaurantId(null)}
                                className="mt-4 text-orange-600 font-bold text-sm"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const restaurant = getRestaurant(item.restaurantId);
                        const isFeatured = item.id === featuredItem?.id && !isSearching && !selectedRestaurantId;
                        const isSaved = savedItemIds.has(item.id);

                        return (
                            <FoodCard
                                key={item.id}
                                item={{
                                    ...item,
                                    restaurantName: restaurant?.name,
                                    restaurantImage: restaurant?.imageUrl,
                                    rating: restaurant?.rating,
                                    category: restaurant?.category
                                }}
                                onSelect={() => onItemSelect(item)}
                                onToggleSave={(e: React.MouseEvent) => onToggleSave(e, item.id)}
                                isSaved={isSaved}
                                onQuickAdd={(e: React.MouseEvent) => handleQuickAdd(e, item)}
                                formatLikes={formatLikes}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Feed;