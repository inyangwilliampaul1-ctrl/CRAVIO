import React, { useEffect, useState } from 'react';
import { Map, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

interface HeatPoint {
    lat: number;
    lng: number;
    intensity: number;
}

interface HeatmapViewProps {
    onClose: () => void;
}

const HeatmapView: React.FC<HeatmapViewProps> = ({ onClose }) => {
    const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch mock heatmap data
        const fetchHeatmap = async () => {
            try {
                // Determine API URL relative to frontend
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                // We use the auth token from local storage if needed, but for MVP mock we might skip or assume logic
                // In a real app we need interceptors. Assuming axios is configured or we use raw axios with header if stored.
                // For this specific 'mock' task, we know the endpoint is public or we construct it.
                // Let's rely on the global axios instance if available, or just use raw fetch for simplicity here
                // assuming the courier controller is protected. 
                // Using a fallback mock for immediate UI testing if auth fails in this isolated component

                // Trying real fetch first
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await axios.get(`${apiUrl}/courier/heatmap`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setHeatPoints(res.data);
                } else {
                    // Fallback if no token (dev mode)
                    setHeatPoints([
                        { lat: 6.4253, lng: 3.4000, intensity: 0.9 },
                        { lat: 6.4300, lng: 3.4100, intensity: 0.8 },
                        { lat: 6.4500, lng: 3.4500, intensity: 0.7 },
                    ]);
                }
            } catch (err) {
                console.error("Failed to fetch heatmap", err);
                // Fallback mock
                setHeatPoints([
                    { lat: 6.4253, lng: 3.4000, intensity: 0.9 },
                    { lat: 6.4300, lng: 3.4100, intensity: 0.8 },
                    { lat: 6.4500, lng: 3.4500, intensity: 0.7 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, []);

    // Simple Projection Logic (Fit mock data to image)
    // Bounds approximately: Lat 6.42 - 6.46, Lng 3.39 - 3.46
    const project = (lat: number, lng: number) => {
        const minLat = 6.420;
        const maxLat = 6.460;
        const minLng = 3.390;
        const maxLng = 3.460;

        const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
        const x = ((lng - minLng) / (maxLng - minLng)) * 100;
        return { x, y };
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Live Demand Map</h1>
                        <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            updating live
                        </p>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-blue-50 overflow-hidden">
                {/* Background Map */}
                <div className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{
                        backgroundImage: `url('/lagos_map.png')`
                    }}
                ></div>

                {/* Heat Layers */}
                {!loading && heatPoints.map((point, idx) => {
                    const pos = project(point.lat, point.lng);
                    return (
                        <div
                            key={idx}
                            className="absolute rounded-full blur-xl animate-pulse"
                            style={{
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                width: '80px',
                                height: '80px',
                                transform: 'translate(-50%, -50%)',
                                background: `radial-gradient(circle, rgba(255,0,0,${point.intensity * 0.6}) 0%, rgba(255,100,0,0) 70%)`
                            }}
                        ></div>
                    );
                })}

                {/* Loading State */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-orange-600" size={32} />
                    </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Demand Intensity</p>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span> High
                        <span className="w-3 h-3 rounded-full bg-orange-400 shadow-sm"></span> Med
                        <span className="w-3 h-3 rounded-full bg-yellow-300 shadow-sm"></span> Low
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatmapView;
