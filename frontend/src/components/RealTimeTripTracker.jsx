import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

const RealTimeTripTracker = ({ ride, userType, onRideComplete }) => {
    const [driverLocation, setDriverLocation] = useState(null);
    const [tripProgress, setTripProgress] = useState(0);
    const [eta, setEta] = useState(null);
    const [phase, setPhase] = useState(ride?.status || 'accepted');
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
        setSocket(newSocket);

        // Listen for ride tracking updates
        newSocket.on(`ride_tracking_${ride._id}`, (data) => {
            setDriverLocation(data.driverLocation);
            setEta(data.eta);
            setTripProgress(data.progress);
            setPhase(data.phase);
        });

        // Listen for user notifications
        if (userType === 'user') {
            newSocket.on(`user_notification_${ride.user_id}`, (notification) => {
                handleNotification(notification);
            });
        }

        // Listen for driver notifications
        if (userType === 'driver') {
            newSocket.on(`driver_notification_${ride.driver_id}`, (notification) => {
                handleNotification(notification);
            });
        }

        return () => {
            newSocket.disconnect();
        };
    }, [ride._id, ride.user_id, ride.driver_id, userType]);

    const handleNotification = (notification) => {
        setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
        
        // Update phase based on notification type
        switch (notification.type) {
            case 'driver_arrived':
                setPhase('driver_arrived');
                break;
            case 'trip_started':
                setPhase('in_progress');
                break;
            case 'trip_completed':
                setPhase('completed');
                if (onRideComplete) onRideComplete();
                break;
            default:
                break;
        }

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
    };

    const getPhaseInfo = () => {
        switch (phase) {
            case 'accepted':
                return {
                    title: 'Driver is on the way',
                    subtitle: 'Your driver is heading to your pickup location',
                    icon: '🚗',
                    color: 'blue'
                };
            case 'driver_arrived':
                return {
                    title: 'Driver has arrived',
                    subtitle: 'Your driver is waiting at the pickup location',
                    icon: '📍',
                    color: 'green'
                };
            case 'in_progress':
                return {
                    title: 'Trip in progress',
                    subtitle: 'Enjoy your ride to the destination',
                    icon: '🛣️',
                    color: 'purple'
                };
            case 'completed':
                return {
                    title: 'Trip completed',
                    subtitle: 'You have arrived at your destination',
                    icon: '✅',
                    color: 'green'
                };
            default:
                return {
                    title: 'Tracking your ride',
                    subtitle: 'Real-time updates will appear here',
                    icon: '📱',
                    color: 'gray'
                };
        }
    };

    const phaseInfo = getPhaseInfo();

    const renderProgressBar = () => (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
                className={`h-2 rounded-full bg-${phaseInfo.color}-500`}
                initial={{ width: 0 }}
                animate={{ width: `${tripProgress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
    );

    const renderDriverInfo = () => {
        if (!ride.driver_info) return null;

        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        {ride.driver_info.photo ? (
                            <img 
                                src={ride.driver_info.photo} 
                                alt="Driver" 
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-xl">👤</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{ride.driver_info.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>⭐ {ride.driver_info.rating}</span>
                            <span>•</span>
                            <span>{ride.driver_info.vehicle_model}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {ride.driver_info.vehicle_number}
                        </div>
                    </div>
                    <div className="text-right">
                        {eta && (
                            <div className="text-lg font-semibold text-blue-600">
                                {eta} min
                            </div>
                        )}
                        <div className="text-xs text-gray-500">ETA</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderLocationUpdate = () => {
        if (!driverLocation) return null;

        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                    <span className="text-blue-600">📍</span>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-blue-800">
                            Current location
                        </div>
                        <div className="text-xs text-blue-600">
                            {driverLocation.address || 'En route'}
                        </div>
                    </div>
                    <div className="text-xs text-blue-500">
                        Live
                    </div>
                </div>
            </div>
        );
    };

    const renderTripDetails = () => (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-800">Trip details</h4>
            
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="text-right font-medium">
                        {ride.pickup_location?.address || 'Pickup location'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="text-right font-medium">
                        {ride.drop_location?.address || 'Destination'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{ride.distance} km</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Fare:</span>
                    <span className="font-medium">₹{ride.fare || ride.estimatedFare}</span>
                </div>
                {ride.otp && userType === 'user' && phase === 'driver_arrived' && (
                    <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">OTP:</span>
                        <span className="font-bold text-lg text-green-600">{ride.otp.code}</span>
                    </div>
                )}
            </div>
        </div>
    );

    const renderActionButtons = () => {
        if (userType === 'driver') {
            switch (phase) {
                case 'accepted':
                    return (
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                            Navigate to pickup
                        </button>
                    );
                case 'driver_arrived':
                    return (
                        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">
                            Verify OTP & Start trip
                        </button>
                    );
                case 'in_progress':
                    return (
                        <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold">
                            Complete trip
                        </button>
                    );
                default:
                    return null;
            }
        }

        // User actions
        if (phase === 'completed') {
            return (
                <div className="space-y-2">
                    <button className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold">
                        Rate your driver
                    </button>
                    <button className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold">
                        Download receipt
                    </button>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Notifications */}
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="bg-blue-600 text-white p-3 text-center text-sm"
                    >
                        {notification.message}
                    </motion.div>
                ))}
            </AnimatePresence>

            <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{phaseInfo.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                        {phaseInfo.title}
                    </h2>
                    <p className="text-gray-600">{phaseInfo.subtitle}</p>
                </div>

                {/* Progress Bar */}
                {renderProgressBar()}

                {/* Driver Info */}
                {renderDriverInfo()}

                {/* Location Update */}
                {renderLocationUpdate()}

                {/* Trip Details */}
                {renderTripDetails()}

                {/* Action Buttons */}
                <div className="mt-6">
                    {renderActionButtons()}
                </div>

                {/* Emergency Button */}
                <div className="mt-4 text-center">
                    <button className="text-red-600 text-sm hover:text-red-800">
                        🚨 Emergency
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RealTimeTripTracker;