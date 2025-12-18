import React, { useState } from 'react';
import { Order, OrderStatus, FoodItem, Restaurant } from '../../types';
import { FOOD_ITEMS } from '../../constants';
import { CheckCircle, Clock, Utensils, ClipboardList, Plus, X, Edit2, Power, AlertCircle, User, MapPin, Wallet, PersonStanding, Lock } from 'lucide-react';

interface VendorDashboardProps {
    orders: Order[];
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
    vendorProfile: Restaurant | undefined;
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

const VendorDashboard: React.FC<VendorDashboardProps> = ({ orders, onUpdateStatus, vendorProfile }) => {
    const [activeTab, setActiveTab] = useState<'ORDERS' | 'MENU'>('ORDERS');

    // Local state for Menu Items
    const [menuItems, setMenuItems] = useState<FoodItem[]>(FOOD_ITEMS.filter(i => i.restaurantId === 'rest_1'));
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItem, setNewItem] = useState<Partial<FoodItem>>({
        name: '',
        description: '',
        price: 0,
        prepTimeMinutes: 15,
        imageUrl: '', // Blank by default, user must upload
        available: true,
        category: 'Mains'
    });

    // BLOCKING SCREEN FOR PENDING VENDORS
    if (vendorProfile && vendorProfile.status === 'PENDING') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                <div className="bg-yellow-100 p-6 rounded-full mb-6 text-yellow-600">
                    <Lock size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification In Progress</h1>
                <p className="text-gray-500 max-w-sm mb-6">
                    Thank you for registering <strong>{vendorProfile.name}</strong>. Our team is currently reviewing your business documentation (RC/BN & BVN).
                </p>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-left w-full max-w-sm space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">Pending Approval</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Est. Review Time</span>
                        <span className="font-bold text-gray-900">24-48 Hours</span>
                    </div>
                </div>
            </div>
        );
    }

    // Helper to format time ago
    const formatTimeAgo = (timestamp: number) => {
        const diffInSeconds = Math.floor((Date.now() - timestamp) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    // --- ORDER MANAGEMENT LOGIC ---
    const incomingOrders = orders.filter(o => o.status === 'PLACED');
    const kitchenOrders = orders.filter(o => ['ACCEPTED', 'PREPARING'].includes(o.status));
    const readyOrders = orders.filter(o => o.status === 'READY');

    const handleOrderAction = (orderId: string, action: 'ACCEPT' | 'REJECT' | 'PREPARE' | 'READY') => {
        let nextStatus: OrderStatus | null = null;
        if (action === 'ACCEPT') nextStatus = 'PREPARING'; // Direct to preparation as requested
        if (action === 'REJECT') nextStatus = 'CANCELLED';
        if (action === 'PREPARE') nextStatus = 'PREPARING';
        if (action === 'READY') nextStatus = 'READY';

        if (nextStatus) onUpdateStatus(orderId, nextStatus);
    };

    // Helper for Payment Status Badge
    const PaymentBadge = ({ order }: { order: Order }) => {
        if (order.paymentMethod === 'FULL_PREPAID') {
            return (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 uppercase tracking-wider">
                    <Wallet size={10} /> Pre-Paid
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded border border-yellow-200 uppercase tracking-wider">
                <Wallet size={10} /> Food Paid • Delivery Due
            </span>
        );
    };

    // --- MENU MANAGEMENT LOGIC ---
    const toggleAvailability = (itemId: string) => {
        setMenuItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, available: !item.available } : item
        ));
    };

    const handleAddItem = () => {
        if (!newItem.name || !newItem.price) return;
        const item: FoodItem = {
            id: `food_${Math.random().toString(36).substr(2, 9)}`,
            restaurantId: 'rest_1',
            name: newItem.name || 'New Item',
            description: newItem.description || '',
            price: newItem.price || 0,
            imageUrl: newItem.imageUrl || '',
            prepTimeMinutes: newItem.prepTimeMinutes || 15,
            available: true,
            category: newItem.category || 'General',
            likes: 0,
            reviews: []
        };
        setMenuItems([...menuItems, item]);
        setIsAddModalOpen(false);
        setNewItem({ name: '', description: '', price: 0, prepTimeMinutes: 15, imageUrl: 'https://picsum.photos/600/600', available: true, category: 'Mains' });
    };

    // Group items by category for display
    const categories = Array.from(new Set(menuItems.map(i => i.category || 'General')));

    return (
        <div className="h-full flex flex-col bg-gray-50">

            {/* 1. Dashboard Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <CravioLogo className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-none">{vendorProfile?.name || 'Burger & Co.'}</h1>
                        <p className="text-xs text-gray-500 font-medium">{vendorProfile?.address || 'Victoria Island, Lagos'}</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('ORDERS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'ORDERS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <ClipboardList size={16} /> Orders
                        {incomingOrders.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{incomingOrders.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('MENU')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'MENU' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Utensils size={16} /> Menu
                    </button>
                </div>
            </header>

            {/* 2. Main Content */}
            <main className="flex-1 overflow-y-auto p-6">

                {/* === ORDERS TAB === */}
                {activeTab === 'ORDERS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                        {/* Column 1: Incoming */}
                        <div className="flex flex-col gap-4">
                            <h2 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                Incoming ({incomingOrders.length})
                            </h2>
                            {incomingOrders.length === 0 ? (
                                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
                                    No pending orders.
                                </div>
                            ) : (
                                incomingOrders.map(order => (
                                    <div key={order.id} className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-4 animate-in slide-in-from-left">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono font-bold text-lg">#{order.id.slice(-4)}</span>
                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                                {formatTimeAgo(order.timestamp)}
                                            </span>
                                        </div>

                                        {/* PICKUP BADGE */}
                                        {order.fulfillmentType === 'PICKUP' && (
                                            <div className="mb-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 w-fit">
                                                <PersonStanding size={12} /> PICKUP ORDER
                                            </div>
                                        )}

                                        {/* Customer Info */}
                                        <div className="mb-3 pb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                                <User size={14} className="text-gray-400" /> Customer #{order.customerId}
                                            </div>
                                            {order.fulfillmentType === 'DELIVERY' && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <MapPin size={12} className="text-gray-400" />
                                                    <span className="truncate max-w-[200px]">12 Adeola Odeku, VI</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1 mb-4">
                                            {order.items.map((i, idx) => (
                                                <div key={idx} className="text-sm text-gray-800">
                                                    <span className="font-bold">{i.quantity}x</span> {i.item.name}
                                                    {i.item.customization && <div className="text-xs text-orange-600 bg-orange-50 px-1 rounded w-fit ml-5">{i.item.customization}</div>}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <PaymentBadge order={order} />
                                            <span className="font-bold text-gray-900">₦{order.totalAmount.toLocaleString()}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOrderAction(order.id, 'REJECT')}
                                                className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleOrderAction(order.id, 'ACCEPT')}
                                                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm"
                                            >
                                                Accept Order
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-center text-gray-400 mt-2">Auto-reject in 90s</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Column 2: In Kitchen */}
                        <div className="flex flex-col gap-4">
                            <h2 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2">
                                <Utensils size={14} /> Preparing ({kitchenOrders.length})
                            </h2>
                            {kitchenOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-mono font-bold text-gray-500">#{order.id.slice(-4)}</span>
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                            <Clock size={12} />
                                            <span>
                                                {formatTimeAgo(order.timestamp)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Prep Progress Visual */}
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full mb-3 overflow-hidden">
                                        <div className="bg-orange-500 h-full rounded-full animate-pulse w-2/3"></div>
                                    </div>

                                    <div className="space-y-1 mb-4 opacity-80">
                                        {order.items.map((i, idx) => (
                                            <div key={idx} className="text-sm text-gray-800">
                                                <span className="font-bold">{i.quantity}x</span> {i.item.name}
                                            </div>
                                        ))}
                                    </div>
                                    {order.status === 'ACCEPTED' ? (
                                        <button
                                            onClick={() => handleOrderAction(order.id, 'PREPARE')}
                                            className="w-full py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-200"
                                        >
                                            Start Cooking
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleOrderAction(order.id, 'READY')}
                                            className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Mark Ready
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Column 3: Ready */}
                        <div className="flex flex-col gap-4">
                            <h2 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-600" /> Ready for {readyOrders.some(o => o.fulfillmentType === 'PICKUP') ? 'Pickup' : 'Delivery'} ({readyOrders.length})
                            </h2>
                            {readyOrders.map(order => (
                                <div key={order.id} className={`bg-green-50 rounded-xl border border-green-200 p-4 opacity-75 ${order.fulfillmentType === 'PICKUP' ? 'border-2 border-green-400' : ''}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono font-bold text-green-800">#{order.id.slice(-4)}</span>
                                        <span className="text-xs font-bold text-green-700 uppercase">
                                            {order.fulfillmentType === 'PICKUP' ? 'Cust. Notified' : 'Rider Notified'}
                                        </span>
                                    </div>
                                    {order.fulfillmentType === 'PICKUP' && (
                                        <div className="mb-2 text-xs font-bold text-green-800 flex items-center gap-1">
                                            <PersonStanding size={12} /> CUSTOMER PICKUP
                                        </div>
                                    )}
                                    <p className="text-sm text-green-800 font-medium">{order.items.length} items packed</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === MENU TAB === */}
                {activeTab === 'MENU' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Menu Inventory</h2>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-orange-700"
                            >
                                <Plus size={18} /> Add New Item
                            </button>
                        </div>

                        <div className="space-y-8">
                            {categories.map(category => (
                                <div key={category}>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">{category}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {menuItems.filter(i => (i.category || 'General') === category).map(item => (
                                            <div key={item.id} className={`bg-white p-4 rounded-xl border flex gap-4 transition-all ${item.available ? 'border-gray-200 shadow-sm' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                                                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-lg object-cover bg-gray-100" />
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                            <span className="font-medium text-gray-900">₦{item.price.toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                        <div className="flex gap-2">
                                                            <button className="text-xs font-bold text-gray-500 flex items-center gap-1 hover:text-gray-900">
                                                                <Edit2 size={12} /> Edit
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => toggleAvailability(item.id)}
                                                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${item.available
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                                                }`}
                                                        >
                                                            <Power size={12} />
                                                            {item.available ? 'Available' : 'Sold Out'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* ADD ITEM MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Add New Item</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none transition-all"
                                        placeholder="e.g. Jollof Rice Special"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option value="Mains">Mains</option>
                                        <option value="Starters">Starters</option>
                                        <option value="Sides">Sides</option>
                                        <option value="Drinks">Drinks</option>
                                        <option value="Dessert">Dessert</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none h-20 resize-none transition-all"
                                    placeholder="Describe the ingredients and flavors..."
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₦)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₦</span>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 p-2 focus:border-orange-500 focus:outline-none font-mono font-bold text-gray-700"
                                            placeholder="0.00"
                                            value={newItem.price || ''}
                                            onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prep Time (min)</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 p-2 focus:border-orange-500 focus:outline-none"
                                            value={newItem.prepTimeMinutes}
                                            onChange={e => setNewItem({ ...newItem, prepTimeMinutes: parseInt(e.target.value) || 15 })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Food Photo <span className="text-red-500">*</span>
                                </label>
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative group ${newItem.imageUrl ? 'border-orange-200 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                setNewItem({ ...newItem, imageUrl: url });
                                            }
                                        }}
                                    />
                                    {newItem.imageUrl ? (
                                        <div className="relative h-40 w-full overflow-hidden rounded-lg shadow-sm">
                                            <img src={newItem.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit2 size={24} className="mb-1" />
                                                <span className="text-sm font-bold">Change Photo</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                                            <div className="bg-gray-100 p-3 rounded-full group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                <Plus size={24} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Click to upload photo</span>
                                            <span className="text-xs">JPG, PNG up to 5MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customization Options</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:outline-none text-sm"
                                    placeholder="e.g. Spicy, Medium, Mild (Comma separated)"
                                    onChange={(e) => {
                                        // Simple way to store options as text description in customization field for now
                                        // Ideally this would be a detailed array, but for MVP text is fine.
                                        // Actually, let's just append to description or handle separate logic?
                                        // The FoodItem type has `customization` as string? No, checking types... 
                                        // FoodItem.customization is 'string | undefined'.
                                        // We'll reuse that for the DEFAULT option or a description of options.
                                        // Let's just store it in description for now or a new field if we had it.
                                        // Wait, `FoodItem` has `customization`? 
                                        // Let's check type definition. It seems to be used as "Selected Customization" in CartItem.
                                        // In FoodItem definition, it might not exist or be different.
                                        // Checking FoodItem type in previous turns... "customization?: string".
                                        // Okay, let's treat it as "Available Options" for the Vendor view.
                                        setNewItem({ ...newItem, customization: e.target.value });
                                    }}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Customers will see these choices.</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddItem}
                                disabled={!newItem.name || !newItem.price || !newItem.imageUrl}
                                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${!newItem.name || !newItem.price || !newItem.imageUrl
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200 hover:shadow-orange-300'
                                    }`}
                            >
                                <CheckCircle size={18} />
                                Save Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;