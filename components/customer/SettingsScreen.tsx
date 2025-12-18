import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Database, Bell } from 'lucide-react';

interface SettingsScreenProps {
    onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const [dataSaver, setDataSaver] = useState(false);
    const [notifications, setNotifications] = useState(true);

    // Mock initial fetch
    useEffect(() => {
        // In a real app, you'd fetch user preferences here
    }, []);

    const toggleDataSaver = async () => {
        const newState = !dataSaver;
        setDataSaver(newState);

        try {
            const apiModule = await import('../../services/api');
            await apiModule.customer.toggleDataSaver(newState);
        } catch (e) {
            console.error("Failed to sync data saver preference", e);
            // Optionally revert state on error
        }
    };

    return (
        <div className="h-full bg-white flex flex-col font-sans animate-in slide-in-from-right">
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-2 sticky top-0 z-10 shadow-sm">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-900" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Section: App Preferences */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">App Preferences</h2>

                    {/* Data Saver Mode */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <Database size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Data Saver Mode</p>
                                <p className="text-xs text-gray-500">Don't auto-play videos</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleDataSaver}
                            className={`w-12 h-6 rounded-full relative transition-colors ${dataSaver ? 'bg-orange-600' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${dataSaver ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Notifications (Mock) */}
                    <div className="flex items-center justify-between py-4 border-t border-gray-100 mt-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Notifications</p>
                                <p className="text-xs text-gray-500">Order updates & promos</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-orange-600' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </section>

                {/* Section: Account */}
                <section className="pt-4 border-t border-gray-100">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Account</h2>
                    <button
                        onClick={() => alert("This would log you out.")}
                        className="w-full text-left py-3 text-red-600 font-bold text-sm"
                    >
                        Log Out
                    </button>
                    <p className="text-center text-xs text-gray-300 mt-6">Version 2.1.0 • Phase 2 Build</p>
                </section>

            </div>
        </div>
    );
};

export default SettingsScreen;
