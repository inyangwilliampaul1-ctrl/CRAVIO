import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_DAILY_STATS, RESTAURANTS } from '../../constants';
import { admin } from '../../services/api';
import { Order } from '../../types';
import { LayoutDashboard, Store, Truck, Settings, Ban, CheckCircle, TrendingUp, AlertTriangle, Search } from 'lucide-react';

interface AdminDashboardProps {
    orders: Order[];
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

// Mock Data for Riders (Since constants didn't have them)
const MOCK_RIDERS = [
    { id: 'r1', name: 'Mike Ross', status: 'ACTIVE', deliveries: 142, rating: 4.9, earnings: 450000.50 },
    { id: 'r2', name: 'Rachel Zane', status: 'ACTIVE', deliveries: 89, rating: 4.8, earnings: 280000.00 },
    { id: 'r3', name: 'Louis Litt', status: 'SUSPENDED', deliveries: 12, rating: 3.2, earnings: 35000.00 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VENDORS' | 'RIDERS' | 'SETTINGS'>('OVERVIEW');
    const [vendors, setVendors] = useState(RESTAURANTS.map(r => ({ ...r, revenue: Math.random() * 1500000 })));
    const [riders, setRiders] = useState(MOCK_RIDERS);

    // Dynamic Stats Calculations
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0) + 12500000; // Mock base + live
    const totalOrders = orders.length + 1205; // Mock base + live

    const toggleVendorStatus = (id: string) => {
        setVendors(prev => prev.map(v => v.id === id ? { ...v, status: v.status === 'APPROVED' ? 'PENDING' : 'APPROVED' } : v));
    };

    const approveVendor = (id: string) => {
        setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'APPROVED' } : v));
    };

    const toggleRiderStatus = (id: string) => {
        setRiders(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : r));
    };

    const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-1 ${activeTab === id ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-500 hover:bg-gray-50'
                }`}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <div className="flex h-full bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col">
                <div className="mb-8 px-2 flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-2 text-orange-600">
                        <CravioLogo className="w-8 h-8" />
                        <span className="text-xl font-bold tracking-tight text-gray-900">Cravio</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Owner Panel</span>
                </div>

                <nav className="flex-1">
                    <SidebarItem id="OVERVIEW" icon={LayoutDashboard} label="Overview" />
                    <SidebarItem id="VENDORS" icon={Store} label="Vendors" />
                    <SidebarItem id="RIDERS" icon={Truck} label="Couriers" />
                    <SidebarItem id="SETTINGS" icon={Settings} label="Settings" />
                </nav>

                <div className="bg-gray-50 p-4 rounded-xl mt-4">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                        <AlertTriangle size={14} />
                        <span className="text-xs font-bold uppercase">System Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-green-700">All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">

                {/* OVERVIEW VIEW */}
                {activeTab === 'OVERVIEW' && (
                    <div className="max-w-5xl">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
                            <p className="text-gray-500">Real-time business performance.</p>
                        </header>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</h3>
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <TrendingUp size={12} /> +12.5%
                                </span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                                <h3 className="text-3xl font-bold text-gray-900">{totalOrders}</h3>
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <TrendingUp size={12} /> +8.2%
                                </span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Active Vendors</p>
                                <h3 className="text-3xl font-bold text-gray-900">{vendors.filter(v => v.status === 'APPROVED').length}</h3>
                                <span className="text-xs text-gray-400 font-medium">/ {vendors.length} Total</span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Avg Delivery Time</p>
                                <h3 className="text-3xl font-bold text-gray-900">28m</h3>
                                <span className="text-xs text-red-500 font-medium">+2m vs target</span>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                            <h3 className="font-bold text-lg mb-6">Revenue Trends</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={MOCK_DAILY_STATS}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} prefix="₦" />
                                        <Tooltip
                                            cursor={{ fill: '#f3f4f6' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="revenue" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* VENDOR MANAGEMENT VIEW */}
                {activeTab === 'VENDORS' && (
                    <div className="max-w-5xl">
                        <header className="mb-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
                                <p className="text-gray-500">Approve restaurants and monitor performance.</p>
                            </div>
                            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold">
                                Add New Vendor
                            </button>
                        </header>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Restaurant</th>
                                        <th className="px-6 py-4 font-semibold">Reg. No</th>
                                        <th className="px-6 py-4 font-semibold">Rating</th>
                                        <th className="px-6 py-4 font-semibold">Revenue (MTD)</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vendors.map(vendor => (
                                        <tr key={vendor.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <img src={vendor.imageUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                <div>
                                                    <span className="font-medium text-gray-900 block">{vendor.name}</span>
                                                    <span className="text-xs text-gray-500">{vendor.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{vendor.businessRegNo || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-bold">⭐ {vendor.rating}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">₦{vendor.revenue.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${vendor.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    vendor.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {vendor.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {vendor.status === 'PENDING' ? (
                                                    <button
                                                        onClick={() => approveVendor(vendor.id)}
                                                        className="text-xs font-bold px-3 py-1 rounded border border-green-200 text-green-600 hover:bg-green-50"
                                                    >
                                                        Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => toggleVendorStatus(vendor.id)}
                                                        className="text-xs font-bold px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                                                    >
                                                        {vendor.status === 'APPROVED' ? 'Suspend' : 'Activate'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* RIDERS MANAGEMENT VIEW */}
                {activeTab === 'RIDERS' && (
                    <div className="max-w-5xl">
                        <header className="mb-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Courier Fleet</h1>
                                <p className="text-gray-500">Manage delivery personnel and payouts.</p>
                            </div>
                        </header>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Rider Name</th>
                                        <th className="px-6 py-4 font-semibold">Deliveries</th>
                                        <th className="px-6 py-4 font-semibold">Rating</th>
                                        <th className="px-6 py-4 font-semibold">Earnings</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {riders.map(rider => (
                                        <tr key={rider.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-500">
                                                    {rider.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{rider.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{rider.deliveries}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-bold">⭐ {rider.rating}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">₦{rider.earnings.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${rider.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {rider.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleRiderStatus(rider.id)}
                                                    className={`text-xs font-bold px-3 py-1 rounded border transition-colors ${rider.status === 'ACTIVE'
                                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {rider.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SETTINGS VIEW */}
                {activeTab === 'SETTINGS' && (
                    <div className="max-w-2xl">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
                            <p className="text-gray-500">Configure global business rules.</p>
                        </header>

                        <SettingsForm />
                    </div>
                )}
            </div>
        </div>
    );
};

// Extracted for cleaner state management
const SettingsForm = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [commission, setCommission] = useState(15);
    const [deliveryFee, setDeliveryFee] = useState(1500);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await admin.updateSettings({
                commissionRate: Number(commission),
                baseDeliveryFee: Number(deliveryFee)
            });

            alert("Settings Saved Successfully! Platform rules updated.");
        } catch (error) {
            console.error(error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Platform Commission (%)</label>
                <input
                    type="number"
                    value={commission}
                    onChange={e => setCommission(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage taken from every restaurant order.</p>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Base Delivery Fee (₦)</label>
                <input
                    type="number"
                    value={deliveryFee}
                    onChange={e => setDeliveryFee(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2"
                />
            </div>
            <div className="pt-4">
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;