import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, CreditCard, Wallet, ShieldCheck, StickyNote, AlertCircle, Smartphone, Copy, CheckCircle, Clock, Store } from 'lucide-react';
import { CartItem } from '../../types';
import LocationPickerMap from './LocationPickerMap';

interface CheckoutScreenProps {
    items: CartItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    location: string;
    fulfillmentType: 'DELIVERY' | 'PICKUP';
    onBack: () => void;
    onPlaceOrder: (notes: string, paymentMethod: 'FULL_PREPAID' | 'PARTIAL_COURIER', isTransfer: boolean, locationDetails?: { lat: number; lng: number; address: string }) => void;
    onLocationChange?: (newAddress: string, lat: number, lng: number) => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
    items,
    subtotal,
    tax,
    deliveryFee,
    total,
    location,
    fulfillmentType,
    onBack,
    onPlaceOrder,
    onLocationChange
}) => {
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Two-step payment selection
    const [paymentSource, setPaymentSource] = useState<'CARD' | 'TRANSFER' | 'WALLET'>('CARD');
    // State for Payment & Fulfillment Selection
    // We combine them here because 'Pickup' acts like a payment mode in the new UI flow
    const [paymentAllocation, setPaymentAllocation] = useState<'FULL_PREPAID' | 'PARTIAL_COURIER' | 'PICKUP'>('FULL_PREPAID');

    // Effect: Sync local state with prop fulfillmentType initially
    useEffect(() => {
        if (fulfillmentType === 'PICKUP') {
            setPaymentAllocation('PICKUP');
        } else {
            setPaymentAllocation('FULL_PREPAID');
        }
    }, [fulfillmentType]);

    // Derived Logic
    const isPickup = paymentAllocation === 'PICKUP';
    // If Pickup, delivery fee is 0. If Courier Payment, delivery fee exists but is paid later.
    const effectiveDeliveryFee = isPickup ? 0 : deliveryFee;

    // Financials
    const foodTotal = subtotal + tax;

    // Total to Pay NOW
    // FULL_PREPAID: Food + Tax + Delivery
    // PARTIAL_COURIER: Food + Tax (Delivery paid later)
    // PICKUP: Food + Tax (No delivery fee)
    const payNowTotal = paymentAllocation === 'FULL_PREPAID'
        ? (subtotal + tax + effectiveDeliveryFee)
        : (subtotal + tax);

    const payLaterTotal = paymentAllocation === 'PARTIAL_COURIER' ? effectiveDeliveryFee : 0;

    // Display Total (Order Summary usually shows the full cost of the SERVICE)
    // For Courier Payment: Total Value = Food + Tax + Delivery (just split payment)
    // For Pickup: Total Value = Food + Tax
    const displayTotal = subtotal + tax + effectiveDeliveryFee;

    const [isProcessing, setIsProcessing] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (showTransferModal && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [showTransferModal, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const sStr = s < 10 ? `0${s}` : `${s}`;
        return `${m}:${sStr}`;
    };

    const handlePlaceOrderClick = () => {
        if (paymentSource === 'TRANSFER') {
            setShowTransferModal(true);
        } else {
            setIsProcessing(true);
            setTimeout(() => {
                // Map local 'PICKUP' state to 'FULL_PREPAID' for backend (since technically you pre-pay food)
                // But we should ideally signal Pickup. 
                // For this task, we assume onPlaceOrder handles the logic or we trust the prop flow?
                // Note: If user selects 'PICKUP' here, we are effectively overriding the delivery mode.
                // We'll pass FULL_PREPAID as the method.
                const finalMethod = paymentAllocation === 'PARTIAL_COURIER' ? 'PARTIAL_COURIER' : 'FULL_PREPAID';
                onPlaceOrder(deliveryNotes, finalMethod, false);
                setIsProcessing(false);
            }, 2000);
        }
    };

    const handleConfirmTransfer = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const finalMethod = paymentAllocation === 'PARTIAL_COURIER' ? 'PARTIAL_COURIER' : 'FULL_PREPAID';
            onPlaceOrder(deliveryNotes, finalMethod, true);
            setIsProcessing(false);
            setShowTransferModal(false);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 animate-in slide-in-from-right duration-300 relative">

            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-2 sticky top-0 z-10 shadow-sm">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-gray-900" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">

                {/* Delivery Address Section (Hidden if Pickup) */}
                {!isPickup ? (
                    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <MapPin size={16} className="text-orange-600" /> Delivery Details
                        </h2>

                        {/* Map Preview / Location Selector */}
                        <div className="mb-4">
                            <div
                                onClick={() => setShowMapPicker(true)}
                                className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group cursor-pointer"
                            >
                                {/* Mini Map Preview Image */}
                                <img src="C:/Users/personal/.gemini/antigravity/brain/6de8659f-eba3-4c0e-87db-55ffa7c29755/lagos_map_mock_1765913290345.png" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Map" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                    <div className="bg-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform group-hover:-translate-y-1 transition-transform">
                                        <MapPin size={12} className="text-orange-600" fill="currentColor" />
                                        <span className="text-xs font-bold text-gray-800">Adjust Pin</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-start mt-3">
                                <div>
                                    <p className="font-bold text-gray-900 text-lg mb-0.5 leading-tight">{location}</p>
                                    <p className="text-xs text-gray-500">Lagos, Nigeria</p>
                                </div>
                                <button
                                    onClick={() => setShowMapPicker(true)}
                                    className="text-orange-600 font-bold text-xs bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 hover:bg-orange-100"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
                                <input
                                    type="tel"
                                    defaultValue="+234 800 123 4567"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Delivery Instructions</label>
                                <div className="relative">
                                    <StickyNote size={16} className="absolute top-3 left-3 text-gray-400" />
                                    <textarea
                                        value={deliveryNotes}
                                        onChange={(e) => setDeliveryNotes(e.target.value)}
                                        placeholder="e.g. Leave at door, Gate code 1234"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-orange-500 h-20 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Store size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-green-900 mb-1">Self-Pickup Order</h2>
                        <p className="text-green-700 text-sm">You will pick up this order directly from the restaurant.</p>
                        <div className="mt-4 p-3 bg-white rounded-lg border border-green-100 text-left">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pickup Location</p>
                            <p className="font-bold text-gray-900">Burger & Co. Lagos</p>
                            <p className="text-xs text-gray-500">12 Adetokunbo Ademola, VI</p>
                        </div>
                    </section>
                )}

                {/* --- MODALS --- */}
                {showMapPicker && (
                    <LocationPickerMap
                        initialAddress={location}
                        onClose={() => setShowMapPicker(false)}
                        onLocationSelect={(loc) => {
                            onLocationChange && onLocationChange(loc.address, loc.lat, loc.lng);
                            setShowMapPicker(false);
                        }}
                    />
                )}

                {/* Order Summary */}
                <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Order Summary</h2>
                    <div className="space-y-3 mb-4">
                        {items.map((line, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                                <div className="flex gap-2">
                                    <span className="font-bold text-gray-900">{line.quantity}x</span>
                                    <div>
                                        <span className="text-gray-700">{line.item.name}</span>
                                        {line.item.customization && (
                                            <p className="text-xs text-gray-500">{line.item.customization}</p>
                                        )}
                                    </div>
                                </div>
                                <span className="text-gray-900 font-medium">₦{(line.item.price * line.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Payment Configuration */}
                <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <CreditCard size={16} className="text-orange-600" /> Payment Selection
                    </h2>

                    {/* 1. Payment Method (Source) */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 mb-2">Select Payment Method</p>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Card Option */}
                            <button
                                onClick={() => setPaymentSource('CARD')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${paymentSource === 'CARD' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <CreditCard size={24} className="mb-2" />
                                <span className="text-sm font-bold">Credit/Debit Card</span>
                            </button>

                            {/* Wallet Option */}
                            <button
                                onClick={() => setPaymentSource('WALLET')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${paymentSource === 'WALLET' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <Wallet size={24} className="mb-2" />
                                <span className="text-sm font-bold">Wallet (₦15k)</span>
                            </button>
                        </div>
                        <div className="mt-2">
                            <button
                                onClick={() => setPaymentSource('TRANSFER')}
                                className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${paymentSource === 'TRANSFER' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <Smartphone size={20} />
                                <span className="text-sm font-bold">Bank Transfer</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. Payment Allocation (The new 3-option logic) */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 mb-2">Payment Option</p>
                        <div className="space-y-3">
                            {/* Option 1: Pay Full Amount */}
                            <label className={`block relative p-4 rounded-xl border cursor-pointer transition-all ${paymentAllocation === 'FULL_PREPAID' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded border border-gray-200 ${paymentAllocation === 'FULL_PREPAID' ? 'bg-white text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Pay Full Amount Now</p>
                                            <p className="text-xs text-gray-500">Includes Food & Delivery Fee</p>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        name="allocation"
                                        checked={paymentAllocation === 'FULL_PREPAID'}
                                        onChange={() => setPaymentAllocation('FULL_PREPAID')}
                                        className="accent-orange-600 w-5 h-5"
                                    />
                                </div>
                            </label>

                            {/* Option 2: Courier Payment */}
                            <label className={`block relative p-4 rounded-xl border cursor-pointer transition-all ${paymentAllocation === 'PARTIAL_COURIER' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded border border-gray-200 ${paymentAllocation === 'PARTIAL_COURIER' ? 'bg-white text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Pay for only food</p>
                                            <p className="text-xs text-gray-500">Ensure to pay the courier on delivery</p>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        name="allocation"
                                        checked={paymentAllocation === 'PARTIAL_COURIER'}
                                        onChange={() => setPaymentAllocation('PARTIAL_COURIER')}
                                        className="accent-orange-600 w-5 h-5"
                                    />
                                </div>
                            </label>

                            {/* Option 3: Pickup in Person */}
                            <label className={`block relative p-4 rounded-xl border cursor-pointer transition-all ${paymentAllocation === 'PICKUP' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded border border-gray-200 ${paymentAllocation === 'PICKUP' ? 'bg-white text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                            <Store size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Pick up in person</p>
                                            <p className="text-xs text-gray-500">Pay only for food. No delivery fee.</p>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        name="allocation"
                                        checked={paymentAllocation === 'PICKUP'}
                                        onChange={() => setPaymentAllocation('PICKUP')}
                                        className="accent-orange-600 w-5 h-5"
                                    />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl animate-in fade-in">
                        <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Payment Split</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-700">Pay Now</span>
                            <span className="font-bold text-gray-900">₦{payNowTotal.toLocaleString()}</span>
                        </div>
                        {payLaterTotal > 0 && (
                            <div className="flex justify-between items-center border-t border-orange-200 pt-2">
                                <span className="text-sm text-gray-700">Pay on Delivery</span>
                                <span className="font-bold text-gray-900">₦{payLaterTotal.toLocaleString()}</span>
                            </div>
                        )}
                        {/* Explicit Warning for Courier Payment */}
                        {paymentAllocation === 'PARTIAL_COURIER' && (
                            <div className="mt-3 bg-white p-2 rounded border border-orange-200 text-xs text-orange-800 flex gap-2 items-start">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <span>
                                    <strong>Note:</strong> Delivery fee of ₦1,500 must be paid directly to the rider upon arrival.
                                </span>
                            </div>
                        )}
                        {isPickup && (
                            <div className="flex justify-between items-center border-t border-orange-200 pt-2">
                                <span className="text-sm text-gray-700">Delivery Fee</span>
                                <span className="font-bold text-green-600">₦0 (Waived)</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                        <AlertCircle size={16} className="text-gray-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500 leading-relaxed">
                            <strong>Note:</strong> Food cost is always pre-paid securely.
                            {paymentSource === 'TRANSFER' && ' Mobile transfers must be completed within 10 minutes.'}
                        </p>
                    </div>
                </section>

                {/* Trust Badge */}
                <div className="flex justify-center items-center gap-2 text-xs text-gray-400 py-2">
                    <ShieldCheck size={14} />
                    <span>Secure 256-bit SSL Encrypted Payment</span>
                </div>
            </div>

            {/* Sticky Bottom Footer */}
            <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>VAT (7.5%)</span>
                        <span>₦{tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery</span>
                        {isPickup ? (
                            <span className="text-green-600 font-bold">₦0</span>
                        ) : paymentAllocation === 'PARTIAL_COURIER' ? (
                            <span>Pay on Delivery</span>
                        ) : (
                            <span>₦{deliveryFee.toLocaleString()}</span>
                        )}
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Total to Pay Now</span>
                        <span>₦{payNowTotal.toLocaleString()}</span>
                    </div>
                </div>

                <button
                    onClick={handlePlaceOrderClick}
                    disabled={isProcessing}
                    className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>Processing...</>
                    ) : (
                        <>Pay Now ₦{payNowTotal.toLocaleString()}</>
                    )}
                </button>
            </div>

            {/* MOBILE TRANSFER MODAL */}
            {showTransferModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Smartphone size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Complete Transfer</h2>
                            <div className="flex items-center justify-center gap-2 mt-2 text-orange-600 font-bold bg-orange-50 py-1 px-3 rounded-full w-fit mx-auto">
                                <Clock size={16} />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-4 mb-6 border border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Bank Name</p>
                                <p className="font-medium text-gray-900">GTBank / Guaranty Trust</p>
                            </div>
                            <div className="relative">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Account Number</p>
                                <p className="font-mono text-lg font-bold text-gray-900">0123456789</p>
                                <button className="absolute right-0 top-1/2 -translate-y-1/2 text-orange-600 p-2">
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Amount to Transfer</p>
                                <p className="font-bold text-2xl text-gray-900 text-orange-600">₦{payNowTotal.toLocaleString()}</p>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-200">
                                Reference Code: <strong>CRV-{Math.floor(Math.random() * 10000)}</strong>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmTransfer}
                            disabled={isProcessing}
                            className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all"
                        >
                            {isProcessing ? 'Verifying...' : 'I Have Sent the Money'}
                        </button>

                        <button
                            onClick={() => setShowTransferModal(false)}
                            className="w-full mt-3 py-2 text-sm text-gray-500 font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutScreen;