import React, { useState } from 'react';
import { Users, Copy, Share2, X, PlusCircle, CheckCircle } from 'lucide-react';

interface GroupOrderModalProps {
    onClose: () => void;
    onStartOrder: (name: string) => void;
}

const GroupOrderModal: React.FC<GroupOrderModalProps> = ({ onClose, onStartOrder }) => {
    const [userName, setUserName] = useState('');
    const [step, setStep] = useState<'INIT' | 'ACTIVE'>('INIT');
    const [code, setCode] = useState('');

    const handleStart = () => {
        if (!userName) return;
        // Simulate Backend API call to create group cart
        const mockCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCode(mockCode);
        setStep('ACTIVE');
        onStartOrder(userName);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(`https://cravio.app/join/${code}`);
        alert('Link copied!');
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">

                {/* Header */}
                <div className="bg-orange-50 p-6 text-center border-b border-orange-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-orange-600">
                        <Users size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Group Order</h2>
                    <p className="text-sm text-gray-500">Order together with friends & split the delivery fee!</p>
                </div>

                <div className="p-6">
                    {step === 'INIT' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Host Name</label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="e.g. Tobi"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 font-medium"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleStart}
                                disabled={!userName}
                                className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition disabled:opacity-50"
                            >
                                Create Group Cart
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                                <p className="text-xs text-orange-600 font-bold uppercase mb-1">Share this Code</p>
                                <p className="text-3xl font-mono font-black text-gray-900 tracking-widest">{code}</p>
                                <p className="text-xs text-gray-400 mt-2">Active until you checkout</p>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={copyCode} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                                    <Copy size={18} /> Copy Link
                                </button>
                                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                                    <Share2 size={18} /> Share
                                </button>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                                <CheckCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800">
                                    <strong>You are the Host.</strong> You can see everyone's items in the cart and you will handle the final payment.
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl"
                            >
                                Go to Menu
                            </button>
                        </div>
                    )}
                </div>

                {step === 'INIT' && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default GroupOrderModal;
