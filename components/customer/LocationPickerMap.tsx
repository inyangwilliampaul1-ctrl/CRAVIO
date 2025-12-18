import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerMapProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
    initialAddress?: string;
    onClose: () => void;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ onLocationSelect, initialAddress, onClose }) => {
    // Lagos Coordinates Center
    const centerLab = { lat: 6.4253, lng: 3.4000 };
    const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage x, y
    const [isDragging, setIsDragging] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const [address, setAddress] = useState(initialAddress || "Victoria Island, Lagos");

    // Mock reverse geocoding on drag end
    const updateAddress = (x: number, y: number) => {
        // Divide map into zones for mock addresses
        if (y < 40) {
            setAddress(x < 50 ? "Adetokunbo Ademola, VI" : "Ozumba Mbadiwe, VI");
        } else if (y > 60) {
            setAddress(x < 50 ? "Adeola Odeku, VI" : "Ligali Ayorinde, VI");
        } else {
            setAddress("Victoria Island, Central");
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            // Clamp values
            const clampedX = Math.max(0, Math.min(100, x));
            const clampedY = Math.max(0, Math.min(100, y));
            setPosition({ x: clampedX, y: clampedY });
            updateAddress(clampedX, clampedY);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Simulating "Use GPS"
    const handleUseGPS = () => {
        setAddress("Oba Akran Ave, Ikeja (GPS)");
        setPosition({ x: 20, y: 30 }); // Jump pin
    };

    const handleConfirm = () => {
        // Calculate mock lat/lng based on percentage offset from center
        const latOffset = (position.y - 50) * -0.0005; // - because y goes down
        const lngOffset = (position.x - 50) * 0.0005;

        onLocationSelect({
            lat: centerLab.lat + latOffset,
            lng: centerLab.lng + lngOffset,
            address: address
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {/* Header */}
            <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-lg text-gray-900">Confirm Delivery Location</h2>
                    <p className="text-sm text-gray-500">Drag map to pin exact location</p>
                </div>
                <button onClick={onClose} className="text-gray-500 font-bold text-sm">Cancel</button>
            </div>

            {/* Map Area */}
            <div
                className="flex-1 relative bg-blue-50 overflow-hidden cursor-move touch-none select-none"
                ref={mapRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            >
                {/* Static Map Image Background */}
                <div className="absolute inset-0 w-[150%] h-[150%] -left-[25%] -top-[25%] opacity-80 pointer-events-none"
                    style={{
                        backgroundImage: `url(${'C:/Users/personal/.gemini/antigravity/brain/6de8659f-eba3-4c0e-87db-55ffa7c29755/lagos_map_mock_1765913290345.png'})`, // Embedding specific artifact
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `translate(${(50 - position.x) / 5}%, ${(50 - position.y) / 5}%)` // Parallax effect
                    }}
                ></div>

                {/* Center Pin Target */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center"
                    style={{
                        // Alternatively move the pin if not using parallax
                        // left: `${position.x}%`, 
                        // top: `${position.y}%` 
                    }}
                >
                    <div className="mb-2 bg-white px-3 py-1.5 rounded-full shadow-lg text-xs font-bold border border-gray-200 whitespace-nowrap animate-bounce">
                        {address}
                    </div>
                    <MapPin size={48} className="text-orange-600 drop-shadow-xl fill-orange-600" />
                    <div className="w-4 h-1 bg-black/20 rounded-full blur-[2px] mt-[-6px]"></div>
                </div>

                {/* Controls */}
                <button
                    onClick={handleUseGPS}
                    className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-xl border border-gray-100 text-blue-600 active:scale-90 transition-transform"
                >
                    <Navigation size={24} fill="currentColor" />
                </button>
            </div>

            {/* Footer */}
            <div className="bg-white p-6 border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                        <MapPin size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 font-bold uppercase">Selected Address</p>
                        <p className="font-bold text-gray-900 text-lg leading-tight truncate">{address}</p>
                    </div>
                </div>
                <button
                    onClick={handleConfirm}
                    className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all"
                >
                    Confirm Location
                </button>
            </div>
        </div>
    );
};

export default LocationPickerMap;
