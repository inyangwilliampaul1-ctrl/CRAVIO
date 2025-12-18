import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { MapPin, Navigation, Package, Phone, Wallet, CheckCircle, Clock, DollarSign, AlertTriangle, ArrowRight, ExternalLink, ShieldAlert, Bike, Camera, Map } from 'lucide-react';
import HeatmapView from './HeatmapView';

interface RiderDashboardProps {
    orders: Order[];
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
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

const RiderDashboard: React.FC<RiderDashboardProps> = ({ orders, onUpdateStatus }) => {
    const [isOnline, setIsOnline] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [photoCaptured, setPhotoCaptured] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);

    // Derive State
    // Filter out Pickup Orders so rider doesn't see them
    const relevantOrders = orders.filter(o => o.fulfillmentType !== 'PICKUP');

    const myActiveOrder = relevantOrders.find(o => ['ASSIGNED', 'PICKED_UP', 'ON_WAY'].includes(o.status));
    const availableOrders = relevantOrders.filter(o => o.status === 'READY');
    const completedOrders = relevantOrders.filter(o => o.status === 'DELIVERED');

    // Earnings Calculation (Delivery Fee only for this demo)
    const todaysEarnings = completedOrders.reduce((acc, curr) => acc + curr.deliveryFee, 0);

    const handleNavigate = (address: string) => {
        // Simulate opening external maps
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    const handleMainAction = () => {
        if (!myActiveOrder) return;

        if (myActiveOrder.status === 'ASSIGNED') {
            onUpdateStatus(myActiveOrder.id, 'PICKED_UP');
        } else if (myActiveOrder.status === 'PICKED_UP') {
            onUpdateStatus(myActiveOrder.id, 'ON_WAY');
        } else if (myActiveOrder.status === 'ON_WAY') {
            // Check for Cash Collection Requirement
            if (myActiveOrder.amountDueOnDelivery > 0) {
                setShowCashModal(true);
            } else {
                // PREPAID ORDER: Require Proof of Delivery
                setShowPhotoModal(true);
                // onUpdateStatus(myActiveOrder.id, 'DELIVERED'); // Moved to confirmPhotoUpload
            }
        }
    };

    const confirmCashCollection = () => {
        if (myActiveOrder) {
            onUpdateStatus(myActiveOrder.id, 'DELIVERED');
            setShowCashModal(false);
        }
    };

    const confirmPhotoUpload = () => {
        if (myActiveOrder) {
            console.log("Uploading photo for order:", myActiveOrder.id);
            // In real app, we would upload the photo Blob here
            onUpdateStatus(myActiveOrder.id, 'DELIVERED');
            setShowPhotoModal(false);
            setPhotoCaptured(false);
        }
    };

    // Steps for the Active Delivery View
    const getStepStatus = () => {
        if (!myActiveOrder) return 0;
        switch (myActiveOrder.status) {
            case 'ASSIGNED': return 1; // Head to Restaurant
            case 'PICKED_UP': return 2; // Head to Customer
            case 'ON_WAY': return 3; // Arriving
            default: return 0;
        }
    };
    const currentStep = getStepStatus();

    return (
        <div className="h-full flex flex-col bg-gray-100 font-sans">

            {/* 1. HEADER & EARNINGS DISPLAY */}
            <div className="bg-gray-900 text-white p-4 pb-6 rounded-b-3xl shadow-lg z-20">
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10 sticky top-0 absolute inset-x-0 top-0 rounded-b-xl mx-4 mt-2">
                    <div className="flex items-center gap-3">
                        <CravioLogo className="w-8 h-8 text-orange-600" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-none">Dispatcher</h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                <p className="text-xs text-gray-500 font-medium">{isOnline ? 'On Duty' : 'Offline'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOnline && (
                            <button
                                onClick={() => setShowHeatmap(true)}
                                className="bg-blue-50 p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                title="View Heatmap"
                            >
                                <Map size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg ${isOnline ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'}`}
                        >
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                </div>

                {/* Spacer for the absolute header */}
                <div className="mt-20"></div>

                {/* Earnings Card */}
                <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center border border-white/10 backdrop-blur-sm mt-4">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Today's Earnings</p>
                        <p className="text-3xl font-bold font-mono text-white">₦{todaysEarnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-600 p-3 rounded-full text-white shadow-lg shadow-orange-900/50">
                        <Wallet size={24} />
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 p-4 overflow-y-auto -mt-4 relative z-10 pb-20">

                {!isOnline ? (
                    // OFFLINE STATE
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 pt-10">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                            <Bike size={48} className="opacity-20 text-gray-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-600 text-lg">You are Offline</h3>
                            <p className="text-sm">Go online to start receiving delivery requests.</p>
                        </div>
                    </div>
                ) : myActiveOrder ? (
                    // === ACTIVE DELIVERY COCKPIT ===
                    <div className="space-y-4 animate-in slide-in-from-bottom duration-500">

                        {/* 1. Status Stepper */}
                        <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center text-xs font-bold text-gray-400">
                            <div className={`flex flex-col items-center gap-1 ${currentStep >= 1 ? 'text-orange-600' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= 1 ? 'bg-orange-50 border-orange-600 scale-110' : 'border-gray-200'}`}>1</div>
                                <span>Pickup</span>
                            </div>
                            <div className="h-0.5 flex-1 bg-gray-200 mx-2 relative">
                                <div className="absolute top-0 left-0 h-full bg-orange-600 transition-all duration-500" style={{ width: currentStep >= 2 ? '100%' : '0%' }}></div>
                            </div>
                            <div className={`flex flex-col items-center gap-1 ${currentStep >= 2 ? 'text-orange-600' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= 2 ? 'bg-orange-50 border-orange-600 scale-110' : 'border-gray-200'}`}>2</div>
                                <span>Dropoff</span>
                            </div>
                            <div className="h-0.5 flex-1 bg-gray-200 mx-2 relative">
                                <div className="absolute top-0 left-0 h-full bg-orange-600 transition-all duration-500" style={{ width: currentStep >= 3 ? '100%' : '0%' }}></div>
                            </div>
                            <div className={`flex flex-col items-center gap-1 ${currentStep >= 3 ? 'text-orange-600' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= 3 ? 'bg-orange-50 border-orange-600 scale-110' : 'border-gray-200'}`}>3</div>
                                <span>Done</span>
                            </div>
                        </div>

                        {/* 2. PERSISTENT CASH ALERT BANNER (High Visibility) */}
                        {myActiveOrder.amountDueOnDelivery > 0 && (
                            <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center animate-pulse border-2 border-red-400">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="text-yellow-300" size={24} strokeWidth={3} />
                                    <span className="text-sm font-bold uppercase tracking-widest text-yellow-300">Cash Collection Required</span>
                                </div>
                                <span className="text-4xl font-black tracking-tight">₦{myActiveOrder.amountDueOnDelivery.toLocaleString()}</span>
                                <p className="text-xs text-red-100 mt-1 font-medium">Do not release order without payment.</p>
                            </div>
                        )}

                        {/* 3. Main Task Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Objective</p>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {myActiveOrder.status === 'ASSIGNED' ? 'Head to Restaurant' :
                                            myActiveOrder.status === 'PICKED_UP' ? 'Head to Customer' :
                                                myActiveOrder.status === 'ON_WAY' ? 'Arriving Now' : ''}
                                    </h2>
                                </div>
                                {/* Timer Simulation */}
                                <div className="bg-white p-2 rounded-lg text-orange-600 font-bold border border-gray-100 flex items-center gap-1 shadow-sm">
                                    <Clock size={16} /> 12:45
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Address & Navigation */}
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm">
                                            <MapPin size={24} fill="currentColor" className="text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">
                                            {myActiveOrder.status === 'ASSIGNED' ? 'Pickup Address' : 'Dropoff Address'}
                                        </p>
                                        <p className="text-lg font-bold text-gray-900 leading-tight mb-1">
                                            {myActiveOrder.status === 'ASSIGNED' ? 'Burger & Co. VI' : `Customer #${myActiveOrder.customerId}`}
                                        </p>
                                        <p className="text-gray-600 text-sm mb-4">
                                            {myActiveOrder.status === 'ASSIGNED' ? '12 Adetokunbo Ademola, VI' : '12 Adeola Odeku, VI'}
                                        </p>

                                        {/* Large Navigation Button */}
                                        <button
                                            onClick={() => handleNavigate(myActiveOrder.status === 'ASSIGNED' ? '12 Adetokunbo Ademola, VI' : '12 Adeola Odeku, VI')}
                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                        >
                                            <Navigation size={18} /> Open Google Maps
                                        </button>
                                    </div>
                                </div>

                                {/* Order Details Accordion (Simplified) */}
                                {myActiveOrder.status !== 'ASSIGNED' && (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-700 text-sm">Order #{myActiveOrder.id.slice(-4)}</span>
                                            <span className="text-xs text-gray-500">{myActiveOrder.items.length} Items</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1 mb-4 pl-1">
                                            {myActiveOrder.items.map((i, idx) => (
                                                <li key={idx} className="truncate">• {i.quantity}x {i.item.name}</li>
                                            ))}
                                        </ul>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button className="py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-700">
                                                <Phone size={16} /> Call
                                            </button>
                                            <button className="py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-700">
                                                Message
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Main Action Button */}
                                <button
                                    onClick={handleMainAction}
                                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${myActiveOrder.status === 'ON_WAY'
                                        ? (myActiveOrder.amountDueOnDelivery > 0 ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200')
                                        : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                                        }`}
                                >
                                    {myActiveOrder.status === 'ASSIGNED' && 'Confirm Pickup'}
                                    {myActiveOrder.status === 'PICKED_UP' && 'Start Delivery'}
                                    {myActiveOrder.status === 'ON_WAY' && (
                                        myActiveOrder.amountDueOnDelivery > 0 ? 'Collect Cash & Finish' : 'Mark Delivered'
                                    )}
                                    <ArrowRight size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // === INCOMING REQUESTS LIST ===
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1 mb-2">
                            <h3 className="font-bold text-gray-800 text-lg">Incoming Requests</h3>
                            {availableOrders.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">{availableOrders.length} New</span>}
                        </div>

                        {availableOrders.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 relative">
                                    <span className="absolute w-full h-full rounded-full border-4 border-gray-300 border-t-orange-500 animate-spin"></span>
                                    <Clock size={24} className="text-gray-400" />
                                </div>
                                <p className="text-gray-900 font-bold">Scanning for orders...</p>
                                <p className="text-xs text-gray-500 mt-1">Stay in high-demand zones (VI, Lekki)</p>
                            </div>
                        ) : (
                            availableOrders.map(order => (
                                <div key={order.id} className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-orange-500 relative overflow-hidden animate-in slide-in-from-right">
                                    {/* Countdown Bar Simulation */}
                                    <div className="absolute top-0 left-0 h-1.5 bg-gray-100 w-full">
                                        <div className="h-full bg-orange-500 w-full animate-[shrink_30s_linear_forwards]"></div>
                                    </div>
                                    <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>

                                    <div className="flex justify-between items-start mb-4 mt-3">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
                                                <Package size={12} />
                                                <span>Delivery Request</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-2xl">₦{(order.deliveryFee).toLocaleString()}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold">YOUR EARNING</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">2.4 km</p>
                                            <p className="text-[10px] text-gray-500 font-bold">TOTAL DIST</p>
                                        </div>
                                    </div>

                                    {/* Alert if Cash Collection Needed */}
                                    {order.amountDueOnDelivery > 0 && (
                                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 flex items-center gap-2 mb-4 text-xs font-bold text-yellow-800">
                                            <AlertTriangle size={16} />
                                            <span>Must Collect ₦{order.amountDueOnDelivery.toLocaleString()} Cash</span>
                                        </div>
                                    )}

                                    <div className="space-y-3 mb-5 border-t border-gray-100 pt-4">
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-0.5"><MapPin size={16} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pickup</p>
                                                <p className="text-sm font-bold text-gray-900">Burger & Co. VI</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-0.5"><MapPin size={16} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dropoff</p>
                                                <p className="text-sm font-bold text-gray-900">12 Adeola Odeku, VI</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <button className="col-span-1 border border-gray-200 text-gray-500 font-bold rounded-xl py-3 text-sm hover:bg-gray-50">
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => onUpdateStatus(order.id, 'ASSIGNED')}
                                            className="col-span-2 bg-gray-900 text-white py-3 rounded-xl font-bold text-lg hover:bg-gray-800 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                                        >
                                            Accept <Clock size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* CASH COLLECTION MODAL */}
            {showCashModal && myActiveOrder && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                                <DollarSign size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Collect Cash</h2>
                            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                                The customer has not paid for delivery yet.<br />
                                You must collect <strong className="text-gray-900">₦{myActiveOrder.amountDueOnDelivery.toLocaleString()}</strong> before handing over the food.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Amount Due</p>
                            <p className="text-4xl font-bold text-gray-900">₦{myActiveOrder.amountDueOnDelivery.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={confirmCashCollection}
                                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} /> I Have Collected Cash
                            </button>
                            <button
                                onClick={() => setShowCashModal(false)}
                                className="w-full py-3 text-gray-500 font-bold hover:text-gray-700"
                            >
                                Not Yet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PHOTO PROOF MODAL */}
            {showPhotoModal && myActiveOrder && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                                <Camera size={40} strokeWidth={2} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Proof of Delivery</h2>
                            <p className="text-gray-500 mt-2 text-sm">
                                This is a prepaid order.<br />
                                Please take a photo of the package at the door/gate.
                            </p>
                        </div>

                        <div className="bg-gray-100 rounded-2xl h-48 mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
                            {photoCaptured ? (
                                <img src="https://picsum.photos/400/300" className="w-full h-full object-cover" alt="Proof" />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Camera size={32} className="mb-2 opacity-50" />
                                    <span className="text-xs font-bold uppercase">No Photo Yet</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {!photoCaptured ? (
                                <button
                                    onClick={() => setPhotoCaptured(true)}
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Camera size={20} /> Take Photo
                                </button>
                            ) : (
                                <button
                                    onClick={confirmPhotoUpload}
                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={20} /> Complete Delivery
                                </button>
                            )}

                            <button
                                onClick={() => setShowPhotoModal(false)}
                                className="w-full py-3 text-gray-500 font-bold hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEATMAP MODAL */}
            {showHeatmap && (
                <HeatmapView onClose={() => setShowHeatmap(false)} />
            )}
        </div>
    );
};

export default RiderDashboard;