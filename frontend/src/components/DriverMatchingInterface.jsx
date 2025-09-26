import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DriverMatchingInterface = ({ rideRequest, onCancel }) => {
    const [searchPhase, setSearchPhase] = useState('searching'); // searching, found, timeout
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
    const [driversFound, setDriversFound] = useState(0);
    const [rideStatus, setRideStatus] = useState(rideRequest?.status || 'searching');

    useEffect(() => {
        // Simulate driver search phases
        const phases = [
            { phase: 'searching', duration: 3000, message: 'Looking for nearby drivers...' },
            { phase: 'broadcasting', duration: 5000, message: 'Sending requests to drivers...' },
            { phase: 'waiting', duration: 30000, message: 'Waiting for driver acceptance...' }
        ];

        let currentPhaseIndex = 0;
        let phaseTimeout;

        const nextPhase = () => {
            if (currentPhaseIndex < phases.length - 1) {
                currentPhaseIndex++;
                setSearchPhase(phases[currentPhaseIndex].phase);
                phaseTimeout = setTimeout(nextPhase, phases[currentPhaseIndex].duration);
            }
        };

        // Start first phase
        phaseTimeout = setTimeout(nextPhase, phases[0].duration);

        // Simulate finding drivers
        const driverInterval = setInterval(() => {
            setDriversFound(prev => Math.min(prev + Math.floor(Math.random() * 3), 8));
        }, 2000);

        return () => {
            clearTimeout(phaseTimeout);
            clearInterval(driverInterval);
        };
    }, []);

    useEffect(() => {
        // Countdown timer
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    setSearchPhase('timeout');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getSearchMessage = () => {
        switch (searchPhase) {
            case 'searching':
                return 'Looking for nearby drivers...';
            case 'broadcasting':
                return 'Sending requests to available drivers...';
            case 'waiting':
                return 'Waiting for a driver to accept...';
            case 'timeout':
                return 'No drivers available right now';
            default:
                return 'Searching for drivers...';
        }
    };

    const renderSearchAnimation = () => {
        if (searchPhase === 'timeout') {
            return (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-32 h-32 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
                >
                    <span className="text-4xl">⏰</span>
                </motion.div>
            );
        }

        return (
            <div className="relative w-32 h-32 mx-auto mb-6">
                {/* Pulsing circles */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-blue-200 rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.2, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                    className="absolute inset-2 bg-blue-300 rounded-full"
                />
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="text-4xl"
                    >
                        🚗
                    </motion.div>
                </div>

                {/* Driver dots around the circle */}
                {[...Array(driversFound)].map((_, index) => {
                    const angle = (index * 360) / 8;
                    const radius = 60;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                        <motion.div
                            key={index}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.2 }}
                            className="absolute w-3 h-3 bg-green-500 rounded-full"
                            style={{
                                left: `50%`,
                                top: `50%`,
                                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    if (searchPhase === 'timeout') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center"
            >
                {renderSearchAnimation()}
                
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    No drivers available
                </h2>
                
                <p className="text-gray-600 mb-6">
                    We couldn't find any available drivers in your area right now. 
                    This might be due to high demand or limited drivers nearby.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Try again
                    </button>
                    
                    <button
                        onClick={onCancel}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Cancel request
                    </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    💡 Try requesting a different vehicle type or wait a few minutes
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Finding your ride
                </h2>
                <div className="text-lg font-semibold text-blue-600">
                    {formatTime(timeRemaining)}
                </div>
            </div>

            {/* Search Animation */}
            {renderSearchAnimation()}

            {/* Status Message */}
            <div className="text-center mb-6">
                <p className="text-gray-700 font-medium mb-2">
                    {getSearchMessage()}
                </p>
                
                {driversFound > 0 && (
                    <p className="text-sm text-green-600">
                        {driversFound} driver{driversFound !== 1 ? 's' : ''} found nearby
                    </p>
                )}
            </div>

            {/* Trip Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">From:</span>
                    <span className="font-medium text-right text-xs">
                        {rideRequest?.pickup_location?.address || 'Current Location'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">To:</span>
                    <span className="font-medium text-right text-xs">
                        {rideRequest?.drop_location?.address || 'Destination'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vehicle:</span>
                    <span className="font-medium capitalize">
                        {rideRequest?.vehicle_type || 'Economy'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fare:</span>
                    <span className="font-medium">
                        ₹{rideRequest?.fare || rideRequest?.finalFare || 'Calculating...'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Distance:</span>
                    <span className="font-medium">
                        {rideRequest?.distance || rideRequest?.pricingDetails?.tripDetails?.distance || 'Calculating...'} km
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="font-medium capitalize text-blue-600">
                        {rideStatus}
                    </span>
                </div>
            </div>

            {/* Progress Indicators */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                        ['searching', 'broadcasting', 'waiting'].includes(searchPhase) 
                            ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm ${
                        searchPhase === 'searching' ? 'font-medium text-blue-600' : 'text-gray-600'
                    }`}>
                        Finding nearby drivers
                    </span>
                </div>
                
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                        ['broadcasting', 'waiting'].includes(searchPhase) 
                            ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm ${
                        searchPhase === 'broadcasting' ? 'font-medium text-blue-600' : 'text-gray-600'
                    }`}>
                        Sending ride requests
                    </span>
                </div>
                
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                        searchPhase === 'waiting' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm ${
                        searchPhase === 'waiting' ? 'font-medium text-blue-600' : 'text-gray-600'
                    }`}>
                        Waiting for acceptance
                    </span>
                </div>
            </div>

            {/* Cancel Button */}
            <button
                onClick={onCancel}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
                Cancel request
            </button>

            {/* Tips */}
            <div className="mt-4 text-xs text-gray-500 text-center">
                💡 Tip: Drivers typically accept rides within 30 seconds
            </div>
        </motion.div>
    );
};

export default DriverMatchingInterface;