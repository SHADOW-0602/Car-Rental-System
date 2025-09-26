import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const TripPlanningInterface = ({ onRideRequest, userLocation }) => {
    const [step, setStep] = useState('destination'); // destination, vehicle, confirm
    const [destination, setDestination] = useState('');
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [vehicleOptions, setVehicleOptions] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const vehicleIcons = {
        economy: '🚗',
        comfort: '🚙',
        suv: '🚐'
    };

    const handleDestinationSubmit = async (e) => {
        e.preventDefault();
        if (!destination.trim()) return;

        setLoading(true);
        setError('');

        try {
            // Use geocoding service or predefined locations
            const mockCoords = await geocodeDestination(destination, userLocation);

            setDestinationCoords(mockCoords);

            // Get upfront pricing
            const response = await api.post('/rides/upfront-pricing', {
                pickup_location: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    address: userLocation.address || 'Current Location'
                },
                drop_location: mockCoords
            });

            if (response.data.success) {
                setVehicleOptions(response.data.vehicleOptions);
                setStep('vehicle');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to get pricing');
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setStep('confirm');
    };

    const handlePromoCode = async () => {
        if (!promoCode.trim() || !selectedVehicle) return;

        setLoading(true);
        try {
            const response = await api.post('/rides/apply-promo', {
                pickup_location: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    address: userLocation.address || 'Current Location'
                },
                drop_location: destinationCoords,
                vehicle_type: selectedVehicle.vehicleType,
                promo_code: promoCode
            });

            if (response.data.success && response.data.promoApplied) {
                setPromoApplied(response.data.promoApplied);
            } else {
                setError(response.data.promoError || 'Invalid promo code');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to apply promo code');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmRide = async () => {
        setLoading(true);
        try {
            const rideData = {
                pickup_location: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    address: userLocation.address || 'Current Location'
                },
                drop_location: destinationCoords,
                vehicle_type: selectedVehicle.vehicleType,
                payment_method: 'razorpay', // Default payment method
                promo_code: promoApplied ? promoApplied.code : undefined
            };

            await onRideRequest(rideData);
        } catch (err) {
            setError(err.message || 'Failed to request ride');
        } finally {
            setLoading(false);
        }
    };

    const renderDestinationStep = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <h2 className="text-2xl font-bold text-gray-800">Where to?</h2>
            <form onSubmit={handleDestinationSubmit} className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Enter destination"
                        className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        📍
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading || !destination.trim()}
                    className="w-full bg-black text-white py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                >
                    {loading ? 'Getting prices...' : 'Get prices'}
                </button>
            </form>
        </motion.div>
    );

    const renderVehicleStep = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Choose a ride</h2>
                <button
                    onClick={() => setStep('destination')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back
                </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
                📍 {userLocation.address || 'Current Location'} → {destination}
            </div>

            <div className="space-y-3">
                {vehicleOptions.map((vehicle) => (
                    <motion.div
                        key={vehicle.vehicleType}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVehicleSelect(vehicle)}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-3xl">
                                    {vehicleIcons[vehicle.vehicleType]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {vehicle.displayName}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {vehicle.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {vehicle.estimatedArrival} min away
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold">
                                    ₹{vehicle.totalFare}
                                </div>
                                {vehicle.surgeMultiplier > 1 && (
                                    <div className="text-xs text-orange-600">
                                        {vehicle.surgeMultiplier}x surge
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-xs text-gray-500 text-center mt-4">
                🔒 Upfront pricing - no surprises
            </div>
        </motion.div>
    );

    const renderConfirmStep = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Confirm your ride</h2>
                <button
                    onClick={() => setStep('vehicle')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back
                </button>
            </div>

            {/* Trip Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                    <div className="text-2xl">{vehicleIcons[selectedVehicle.vehicleType]}</div>
                    <div>
                        <h3 className="font-semibold">{selectedVehicle.displayName}</h3>
                        <p className="text-sm text-gray-600">
                            {selectedVehicle.estimatedArrival} min away
                        </p>
                    </div>
                </div>
                
                <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>📍 From:</span>
                        <span className="text-right">{userLocation.address || 'Current Location'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>🎯 To:</span>
                        <span className="text-right">{destination}</span>
                    </div>
                </div>
            </div>

            {/* Promo Code */}
            <div className="space-y-3">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Promo code"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading || promoApplied}
                    />
                    <button
                        onClick={handlePromoCode}
                        disabled={loading || !promoCode.trim() || promoApplied}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply
                    </button>
                </div>
                
                {promoApplied && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-green-600">✅</span>
                            <span className="text-green-800 font-medium">
                                {promoApplied.code} applied! Saved ₹{promoApplied.discount}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Fare Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-800">Fare breakdown</h4>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Base fare</span>
                        <span>₹{selectedVehicle.fareBreakdown.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Distance fare</span>
                        <span>₹{selectedVehicle.fareBreakdown.distanceFare}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Time fare</span>
                        <span>₹{selectedVehicle.fareBreakdown.timeFare}</span>
                    </div>
                    {selectedVehicle.fareBreakdown.surgeAmount > 0 && (
                        <div className="flex justify-between text-orange-600">
                            <span>Surge pricing</span>
                            <span>₹{selectedVehicle.fareBreakdown.surgeAmount}</span>
                        </div>
                    )}
                    {selectedVehicle.fareBreakdown.serviceFee > 0 && (
                        <div className="flex justify-between">
                            <span>Service fee</span>
                            <span>₹{selectedVehicle.fareBreakdown.serviceFee}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{selectedVehicle.fareBreakdown.tax}</span>
                    </div>
                    {promoApplied && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount ({promoApplied.code})</span>
                            <span>-₹{promoApplied.discount}</span>
                        </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{promoApplied ? promoApplied.finalFare : selectedVehicle.totalFare}</span>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <button
                onClick={handleConfirmRide}
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
                {loading ? 'Requesting ride...' : 'Confirm ride'}
            </button>

            <div className="text-xs text-gray-500 text-center">
                By confirming, you agree to the fare shown above
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
                    >
                        <div className="flex items-center space-x-2">
                            <span className="text-red-600">⚠️</span>
                            <span className="text-red-800 text-sm">{error}</span>
                        </div>
                        <button
                            onClick={() => setError('')}
                            className="text-red-600 text-xs mt-1 hover:text-red-800"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {step === 'destination' && renderDestinationStep()}
                {step === 'vehicle' && renderVehicleStep()}
                {step === 'confirm' && renderConfirmStep()}
            </AnimatePresence>
        </div>
    );
};

// Geocoding function for destinations
const geocodeDestination = async (destination, userLocation) => {
    // Generate coordinates based on destination name hash for consistency
    const hash = destination.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    // Use hash to generate consistent but varied coordinates
    const normalizedHash = Math.abs(hash) / 2147483647; // Normalize to 0-1
    
    // Delhi NCR bounds
    const bounds = {
        north: 28.8,
        south: 28.4,
        east: 77.4,
        west: 76.8
    };
    
    // Generate coordinates within Delhi NCR based on destination name
    const latitude = bounds.south + (bounds.north - bounds.south) * normalizedHash;
    const longitude = bounds.west + (bounds.east - bounds.west) * ((normalizedHash * 7) % 1);
    
    // Ensure minimum distance from user location (at least 5km)
    const minDistance = 5; // km
    const distance = calculateDistance(userLocation.latitude, userLocation.longitude, latitude, longitude);
    
    if (distance < minDistance) {
        // Force minimum distance with better distribution
        const angle = (normalizedHash * 360) % 360; // 0-360 degrees
        const actualDistance = minDistance + (normalizedHash * 10); // 5-15km range
        
        const adjustedLat = userLocation.latitude + (actualDistance / 111) * Math.cos(angle * Math.PI / 180);
        const adjustedLng = userLocation.longitude + (actualDistance / (111 * Math.cos(userLocation.latitude * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);
        
        return {
            latitude: adjustedLat,
            longitude: adjustedLng,
            address: destination
        };
    }
    
    return {
        latitude,
        longitude,
        address: destination
    };
};

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export default TripPlanningInterface;