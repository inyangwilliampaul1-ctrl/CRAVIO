import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, History } from 'lucide-react';

interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'PAYMENT' | 'REFUND';
    amount: number;
    description: string;
    date: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

interface WalletScreenProps {
    onBack?: () => void;
}

const WalletScreen: React.FC<WalletScreenProps> = ({ onBack }) => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');

    // Mock Fetch Logic
    useEffect(() => {
        // Simulate API Call
        setTimeout(() => {
            setBalance(15000);
            setTransactions([
                { id: '1', type: 'DEPOSIT', amount: 20000, description: 'Wallet Top-up', date: 'Today, 10:23 AM', status: 'SUCCESS' },
                { id: '2', type: 'PAYMENT', amount: 4500, description: 'Order #4821 - Burger & Co', date: 'Yesterday, 8:45 PM', status: 'SUCCESS' },
                { id: '3', type: 'PAYMENT', amount: 1200, description: 'Delivery Fee', date: 'Yesterday, 8:45 PM', status: 'SUCCESS' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleTopUp = () => {
        if (!topUpAmount) return;
        setLoading(true);

        // Simulate Top Up
        setTimeout(() => {
            const amount = parseFloat(topUpAmount);
            setBalance(prev => prev + amount);
            setTransactions(prev => [
                { id: Math.random().toString(), type: 'DEPOSIT', amount, description: 'Wallet Top-up', date: 'Just now', status: 'SUCCESS' },
                ...prev
            ]);
            setShowTopUpModal(false);
            setTopUpAmount('');
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="h-full bg-white flex flex-col font-sans">
            {/* Header */}
            <div className="bg-gray-900 text-white p-6 pb-8 rounded-b-3xl shadow-xl z-10 relative overflow-hidden">
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[60px] opacity-20 transform translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-[40px] opacity-20 transform -translate-x-5 translate-y-5"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                        <Wallet size={24} className="text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">My Wallet</h1>
                        <p className="text-xs text-gray-400">Manage your finances</p>
                    </div>
                </div>

                <div className="text-center relative z-10">
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Total Balance</p>
                    <h2 className="text-4xl font-extrabold tracking-tight mb-6">₦ {balance.toLocaleString()}</h2>

                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                        <button
                            onClick={() => setShowTopUpModal(true)}
                            className="bg-orange-600 hover:bg-orange-500 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-900/50 transition-all active:scale-95"
                        >
                            <Plus size={18} /> Top Up
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all">
                            <History size={18} /> History
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 -mt-2 pt-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                    Recent Transactions
                    <span className="text-xs text-blue-600 font-medium cursor-pointer">View All</span>
                </h3>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{tx.description}</p>
                                        <p className="text-xs text-gray-400">{tx.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium tracking-wide">{tx.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Up Modal */}
            {showTopUpModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Fund Wallet</h2>
                            <p className="text-gray-500 text-sm mt-1">Enter amount using your card.</p>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Amount (₦)</label>
                            <input
                                type="number"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                className="w-full text-2xl font-bold text-center py-4 border-b-2 border-orange-200 focus:border-orange-600 outline-none text-gray-900 placeholder-gray-300"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {[1000, 5000, 10000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setTopUpAmount(amt.toString())}
                                    className="py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition"
                                >
                                    ₦{amt.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleTopUp}
                            disabled={!topUpAmount || loading}
                            className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Processing...' : 'Pay Securely'}
                        </button>

                        <button
                            onClick={() => setShowTopUpModal(false)}
                            className="w-full mt-3 py-3 text-gray-500 font-bold hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletScreen;
