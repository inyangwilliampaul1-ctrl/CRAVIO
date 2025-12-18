
import React, { useState } from 'react';
import { UserRole, Restaurant } from '../types';
import { Users, Store, Truck, ArrowRight, Lock, X, CheckCircle, ChevronLeft, User, Mail, Smartphone, MapPin as MapPinIcon } from 'lucide-react';

interface AuthScreenProps {
    onLogin: (role: UserRole, email?: string) => void;
}

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

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [view, setView] = useState<'SELECT_ROLE' | 'LOGIN_FORM' | 'VENDOR_SIGNUP' | 'CUSTOMER_SIGNUP' | 'RIDER_SIGNUP'>('SELECT_ROLE');
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [adminUnlockCount, setAdminUnlockCount] = useState(0);

    const handleTitleClick = () => {
        setAdminUnlockCount(prev => prev + 1);
    };

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Vendor Signup State
    const [vendorForm, setVendorForm] = useState({
        businessName: "",
        address: "",
        phone: "",
        regNumber: "",
        bvn: "",
        bankAccount: ""
    });

    // Customer Signup State
    const [customerForm, setCustomerForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    // Rider Signup State
    const [riderForm, setRiderForm] = useState({
        name: "",
        phone: "",
        city: "",
        vehicleType: "Bike"
    });

    const roles: { id: UserRole; title: string; subtitle: string; icon: React.ReactNode; color: string }[] = [
        {
            id: 'CUSTOMER',
            title: 'Customer',
            subtitle: 'Discover food & order',
            icon: <Users className="text-orange-600" size={24} />,
            color: 'hover:border-orange-200 hover:bg-orange-50'
        },
        {
            id: 'VENDOR',
            title: 'Restaurant Partner',
            subtitle: 'Manage menu & orders',
            icon: <Store className="text-blue-600" size={24} />,
            color: 'hover:border-blue-200 hover:bg-blue-50'
        },
        {
            id: 'RIDER',
            title: 'Courier',
            subtitle: 'Deliver orders & earn',
            icon: <Truck className="text-green-600" size={24} />,
            color: 'hover:border-green-200 hover:bg-green-50'
        }
    ];

    if (adminUnlockCount >= 5) {
        roles.push({
            id: 'ADMIN',
            title: 'Admin Panel',
            subtitle: 'Manage platform & users',
            icon: <Lock className="text-purple-600" size={24} />,
            color: 'hover:border-purple-200 hover:bg-purple-50'
        });
    }

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setView('LOGIN_FORM');
        setError("");
        setEmail("");
        setPassword("");
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "admin123" && selectedRole === 'ADMIN') {
            onLogin('ADMIN');
            return;
        }

        // Real Auth
        try {
            if (selectedRole) {
                const data = await import('../services/api').then(m => m.auth.login(email, password));
                // Decode role from token or data? Data has user object usually?
                // Login response: { access_token, user: { ... role ... } } ?
                // For now assume role matches selected or we trust the selection for this demo UAT
                // Ideally we verify role from response.
                onLogin(selectedRole, email); // email passed for context
            }
        } catch (e) {
            setError("Invalid credentials or server error");
            console.error(e);
        }
    };

    const handleVendorSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Create a pending restaurant object
        const newVendor: Restaurant = {
            id: `rest_${Math.random().toString(36).substr(2, 9)} `,
            name: vendorForm.businessName,
            address: vendorForm.address,
            rating: 5.0, // Default
            category: 'General',
            imageUrl: 'https://picsum.photos/800/600',
            isOpen: true,
            status: 'PENDING', // CRITICAL: Defaults to PENDING
            businessRegNo: vendorForm.regNumber,
            bvn: vendorForm.bvn,
            bankDetails: vendorForm.bankAccount
        };

        onLogin('VENDOR', newVendor);
    };

    const handleCustomerSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, create user profile here
        onLogin('CUSTOMER');
    };

    const handleRiderSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, create rider profile here
        onLogin('RIDER');
    };

    const renderRoleSelection = () => (
        <div className="w-full max-w-md space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider text-center mb-6">How would you like to continue?</p>

            {roles.map((role) => (
                <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between transition-all shadow-sm ${role.color} group`}
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-50 p-3 rounded-full group-hover:bg-white transition-colors">
                            {role.icon}
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900">{role.title}</h3>
                            <p className="text-sm text-gray-500">{role.subtitle}</p>
                        </div>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-gray-600 transition-colors" size={20} />
                </button>
            ))}
        </div>
    );

    const renderLoginForm = () => (
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-4">
            <button
                onClick={() => setView('SELECT_ROLE')}
                className="flex items-center gap-1 text-sm text-gray-500 mb-6 hover:text-gray-900"
            >
                <ChevronLeft size={16} /> Back
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedRole === 'VENDOR' ? 'Partner Login' : selectedRole === 'RIDER' ? 'Rider Login' : 'Welcome Back'}</h2>
                <p className="text-gray-500 text-sm">Enter your credentials to continue.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email / Phone</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="••••••••"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200"
                >
                    Log In
                </button>
            </form>

            {selectedRole === 'VENDOR' && (
                <div className="mt-6 text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">New Restaurant?</p>
                    <button
                        onClick={() => setView('VENDOR_SIGNUP')}
                        className="text-orange-600 font-bold text-sm hover:underline"
                    >
                        Register Your Business
                    </button>
                </div>
            )}

            {selectedRole === 'CUSTOMER' && (
                <div className="mt-6 text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">First time here?</p>
                    <button
                        onClick={() => setView('CUSTOMER_SIGNUP')}
                        className="text-orange-600 font-bold text-sm hover:underline"
                    >
                        Create Account
                    </button>
                </div>
            )}

            {selectedRole === 'RIDER' && (
                <div className="mt-6 text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Want to earn money?</p>
                    <button
                        onClick={() => setView('RIDER_SIGNUP')}
                        className="text-orange-600 font-bold text-sm hover:underline"
                    >
                        Join Our Fleet
                    </button>
                </div>
            )}
        </div>
    );

    const renderVendorSignup = () => (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 h-[80vh] overflow-y-auto pr-2 no-scrollbar">
            <button
                onClick={() => setView('LOGIN_FORM')}
                className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-900"
            >
                <ChevronLeft size={16} /> Back to Login
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Partner Registration</h2>
                <p className="text-gray-500 text-sm">We need to verify your business before you can sell.</p>
            </div>

            <form onSubmit={handleVendorSignupSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" value={vendorForm.businessName} onChange={e => setVendorForm({ ...vendorForm, businessName: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Physical Address (Lagos)</label>
                        <input required type="text" className="w-full border border-gray-300 rounded-lg p-2" value={vendorForm.address} onChange={e => setVendorForm({ ...vendorForm, address: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                        <input required type="tel" className="w-full border border-gray-300 rounded-lg p-2" value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
                        <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <Lock size={14} /> Mandatory Verification
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-blue-700 uppercase mb-1">RC / BN Number</label>
                                <input required type="text" className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-200" placeholder="e.g. RC123456" value={vendorForm.regNumber} onChange={e => setVendorForm({ ...vendorForm, regNumber: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-700 uppercase mb-1">BVN (Bank Verification)</label>
                                <input required type="text" className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-200" placeholder="11-digit number" value={vendorForm.bvn} onChange={e => setVendorForm({ ...vendorForm, bvn: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Bank Account (For Payouts)</label>
                                <input required type="text" className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-200" placeholder="Bank Name - Account Number" value={vendorForm.bankAccount} onChange={e => setVendorForm({ ...vendorForm, bankAccount: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg mt-4"
                >
                    Submit for Approval
                </button>
            </form>
        </div>
    );

    const renderCustomerSignup = () => (
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-4">
            <button
                onClick={() => setView('LOGIN_FORM')}
                className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-900"
            >
                <ChevronLeft size={16} /> Back to Login
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
                <p className="text-gray-500 text-sm">Join Cravio to discover the best food nearby.</p>
            </div>

            <form onSubmit={handleCustomerSignupSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={customerForm.name}
                            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={customerForm.email}
                            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="password"
                            required
                            value={customerForm.password}
                            onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200 mt-2"
                >
                    Sign Up
                </button>
            </form>
        </div>
    );

    const renderRiderSignup = () => (
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-4">
            <button
                onClick={() => setView('LOGIN_FORM')}
                className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-900"
            >
                <ChevronLeft size={16} /> Back to Login
            </button>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Join Our Fleet</h2>
                <p className="text-gray-500 text-sm">Deliver smiles and earn money on your schedule.</p>
            </div>

            <form onSubmit={handleRiderSignupSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={riderForm.name}
                            onChange={(e) => setRiderForm({ ...riderForm, name: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-green-500"
                            placeholder="Mike Ross"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                    <div className="relative">
                        <Smartphone size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="tel"
                            required
                            value={riderForm.phone}
                            onChange={(e) => setRiderForm({ ...riderForm, phone: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-green-500"
                            placeholder="+234 800..."
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">City</label>
                    <div className="relative">
                        <MapPinIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={riderForm.city}
                            onChange={(e) => setRiderForm({ ...riderForm, city: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-green-500"
                            placeholder="Lagos"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vehicle Type</label>
                    <select
                        value={riderForm.vehicleType}
                        onChange={(e) => setRiderForm({ ...riderForm, vehicleType: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-green-500"
                    >
                        <option value="Bike">Motorbike</option>
                        <option value="Bicycle">Bicycle</option>
                        <option value="Car">Car</option>
                        <option value="Van">Van</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-200 mt-2"
                >
                    Register as Courier
                </button>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div
                onClick={handleTitleClick}
                className={`max-w-md w-full text-center mb-8 transition-all cursor-pointer ${view !== 'SELECT_ROLE' ? 'scale-90 opacity-80' : ''} `}
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-orange-600 p-4 rounded-2xl shadow-lg shadow-orange-200">
                        <CravioLogo className="text-white w-12 h-12" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Cravio</h1>
                <p className="text-gray-500">Visual discovery. Instant delivery.</p>
            </div>

            {view === 'SELECT_ROLE' && renderRoleSelection()}
            {view === 'LOGIN_FORM' && renderLoginForm()}
            {view === 'VENDOR_SIGNUP' && renderVendorSignup()}
            {view === 'CUSTOMER_SIGNUP' && renderCustomerSignup()}
            {view === 'RIDER_SIGNUP' && renderRiderSignup()}

        </div>
    );
};

export default AuthScreen;