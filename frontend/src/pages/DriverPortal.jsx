import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import VerifiedBadge from '../components/VerifiedBadge';
import DriverRideInterface from '../components/DriverRideInterface';

import api from '../services/api';
import io from 'socket.io-client';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '../animations/variants';
import { AnimatedButton, AnimatedCard, AnimatedContainer } from '../animations/AnimatedComponents';
import { ScrollFadeIn, ScrollSlideLeft } from '../animations/ScrollAnimatedComponents';


export default function DriverPortal() {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState('requests');
    const [rideRequests, setRideRequests] = useState([]);
    const [myRides, setMyRides] = useState([]);

    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [socket, setSocket] = useState(null);
    const [driverStats, setDriverStats] = useState({
        rating: 0,
        totalRatings: 0,
        completedRides: 0,
        totalEarnings: 0,
        thisMonthEarnings: 0
    });
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRideForRating, setSelectedRideForRating] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [userFeedback, setUserFeedback] = useState('');
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [selectedRideForOTP, setSelectedRideForOTP] = useState(null);
    const [otpInput, setOtpInput] = useState('');

    useEffect(() => {
        if (user && user._id) {
            setRideRequests([]);
            loadRideRequests();
            loadMyRides();
            
            // Only initialize socket if not already connected
            if (!socket) {
                const cleanup = initializeSocket();
            }
            
            getCurrentLocation();
            
            const locationInterval = setInterval(() => {
                getCurrentLocation();
            }, 30000);
            
            return () => {
                clearInterval(locationInterval);
                // Don't disconnect socket on component unmount
            };
        }
    }, [user]);

    const loadDriverStats = async () => {
        try {
            const completedRides = myRides.filter(r => r.status === 'completed');
            const totalEarnings = completedRides.reduce((sum, r) => sum + (r.fare || 0), 0);
            const thisMonth = new Date();
            thisMonth.setDate(1);
            const thisMonthRides = completedRides.filter(r => new Date(r.createdAt) >= thisMonth);
            const thisMonthEarnings = thisMonthRides.reduce((sum, r) => sum + (r.fare || 0), 0);
            
            // Get actual rating count from API
            let totalRatings = 0;
            try {
                const ratingsResponse = await api.get('/ratings/driver-summary');
                totalRatings = ratingsResponse.data.totalRatings || 0;
            } catch (ratingsError) {
                console.error('Error fetching ratings:', ratingsError);
            }
            
            setDriverStats({
                rating: user.rating || 0,
                totalRatings,
                completedRides: completedRides.length,
                totalEarnings,
                thisMonthEarnings
            });
        } catch (error) {
            console.error('Error loading driver stats:', error);
        }
    };

    const initializeSocket = () => {
        if (!user || !user._id) {
            console.warn('Cannot initialize socket: user not available');
            return;
        }
        
        const newSocket = io('http://localhost:5000', {
            auth: {
                token: localStorage.getItem('token'),
                userId: user._id,
                role: 'driver'
            },
            transports: ['websocket', 'polling']
        });

        // Listen for ride requests specifically for this driver
        newSocket.on(`driver_notification_${user._id}`, (data) => {
            console.log('Received driver notification:', data);
            if (data.type === 'ride_request') {
                const newRequest = {
                    _id: data.rideId,
                    pickup_location: { address: data.pickup },
                    drop_location: { address: data.destination },
                    fare: data.fare,
                    distance: data.distance,
                    vehicle_type: data.vehicle_type,
                    payment_method: data.payment_method,
                    user_id: { name: data.message.split(' from ')[1] },
                    isPreferred: data.isPreferred || false,
                    timestamp: data.timestamp
                };
                console.log('Created new request object:', newRequest);
                setRideRequests(prev => {
                    const existing = Array.isArray(prev) ? prev : [];
                    const alreadyExists = existing.some(req => req._id === newRequest._id);
                    if (alreadyExists) {
                        console.log('Request already exists, skipping duplicate');
                        return existing;
                    }
                    console.log('Adding new request to list');
                    return [...existing, newRequest];
                });
            } else if (data.type === 'remove_ride_request') {
                console.log('Removing ride request:', data.rideId);
                setRideRequests(prev => prev.filter(req => req._id !== data.rideId));
            } else if (data.type === 'payment_received') {
                console.log('Payment received notification:', data);
                alert(`💰 Payment Received!\n\nAmount: ₹${data.amount}\nFrom: ${data.message.split('from ')[1].split('.')[0]}\n\nYou can now end the ride.`);
                loadMyRides(); // Refresh rides to show updated payment status
            }
        });
        
        // Listen for ride no longer available notifications
        newSocket.on('ride_no_longer_available', (data) => {
            console.log('Ride no longer available:', data);
            setRideRequests(prev => {
                const filtered = prev.filter(req => req._id !== data.rideId);
                console.log('Removed ride from requests:', data.rideId);
                return filtered;
            });
        });

        newSocket.on('connect', () => {
            console.log('Driver connected to server');
        });

        newSocket.on('disconnect', () => {
            console.log('Driver disconnected from server');
        });

        setSocket(newSocket);
        
        return () => {
            console.log('Cleaning up socket connection');
            newSocket.disconnect();
        };
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setLocation(newLocation);
                    updateLocationOnServer(newLocation);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // Don't use default location, just log the error
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } else {
            console.error('Geolocation not supported by this browser');
        }
    };

    const updateLocationOnServer = async (newLocation) => {
        if (!newLocation || !newLocation.lat || !newLocation.lng) {
            console.error('Invalid location data:', newLocation);
            return;
        }
        
        try {
            // Use the new location endpoint
            const response = await api.put('/location/update', {
                latitude: newLocation.lat,
                longitude: newLocation.lng,
                address: 'Current Location',
                status: 'available'
            });
            
            if (response.data.success) {
                console.log('Location updated successfully:', response.data.message);
            }
            
            // Also update via socket for real-time updates
            if (socket) {
                socket.emit('updateLocation', {
                    driverId: user._id,
                    location: {
                        latitude: newLocation.lat,
                        longitude: newLocation.lng
                    }
                });
            }
        } catch (error) {
            console.error('Error updating location:', error);
            // Fallback to old endpoint
            try {
                await api.put('/users/location', {
                    latitude: newLocation.lat,
                    longitude: newLocation.lng
                });
            } catch (fallbackError) {
                console.error('Fallback location update failed:', fallbackError);
            }
        }
    };

    const loadRideRequests = async () => {
        try {
            console.log('Loading ride requests...');
            const response = await api.get('/rides/requests');
            console.log('Ride requests response:', response.data);
            const requests = response.data.requests || response.data || [];
            console.log('Processed requests:', requests);
            
            // Only update if we have valid requests and avoid duplicates
            setRideRequests(prev => {
                const newRequests = Array.isArray(requests) ? requests : [];
                // Filter out any duplicates based on _id
                const uniqueRequests = newRequests.filter(newReq => 
                    !prev.some(existingReq => existingReq._id === newReq._id)
                );
                
                if (uniqueRequests.length > 0) {
                    console.log('Adding unique requests:', uniqueRequests.length);
                    return [...prev, ...uniqueRequests];
                }
                return prev;
            });
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const loadMyRides = async () => {
        try {
            const response = await api.get('/rides/driver');
            const rides = response.data.rides || response.data || [];
            console.log('Loaded driver rides:', rides);
            setMyRides(Array.isArray(rides) ? rides : []);
        } catch (error) {
            console.error('Error loading rides:', error);
            setMyRides([]);
        }
    };

    useEffect(() => {
        if (myRides.length > 0) {
            loadDriverStats();
        }
    }, [myRides]);

    const acceptRide = async (rideId) => {
        try {
            console.log('Attempting to accept ride:', rideId);
            
            // Validate ride ID format
            if (!rideId || typeof rideId !== 'string' || rideId.length !== 24) {
                console.error('Invalid ride ID format:', rideId);
                alert('Invalid ride ID format');
                return;
            }
            
            // Immediately remove from local state to prevent double-clicking
            setRideRequests(prev => prev.filter(req => req._id !== rideId));
            
            console.log('Making API call to accept ride...');
            const response = await api.put(`/rides/${rideId}/accept`);
            console.log('Accept ride response:', response.data);
            
            if (response.data.success) {
                alert('Ride accepted successfully!');
                loadMyRides();
                
                // Start location updates for live tracking
                const locationUpdateInterval = setInterval(() => {
                    getCurrentLocation();
                }, 10000);
                
                window.driverLocationInterval = locationUpdateInterval;
            } else {
                console.error('Accept ride failed:', response.data);
                alert(response.data.error || 'Failed to accept ride');
                loadRideRequests();
            }
        } catch (error) {
            console.error('Accept ride error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // Re-add the request back to the list if there was an error
            loadRideRequests();
            
            if (error.response?.status === 404) {
                alert('Ride not found or already accepted by another driver');
            } else if (error.response?.status === 400) {
                alert(error.response.data?.error || 'Invalid request');
            } else if (error.response?.status === 403) {
                alert('You are not authorized to accept this ride');
            } else if (error.response?.status === 401) {
                alert('Authentication failed. Please login again.');
            } else {
                alert('Failed to accept ride. Please try again.');
            }
        }
    };

    const declineRide = async (rideId) => {
        try {
            console.log('Declining ride:', rideId);
            
            // Remove from local state immediately
            setRideRequests(prev => {
                const filtered = prev.filter(req => req._id !== rideId);
                console.log('Removed declined ride from local state');
                return filtered;
            });
            
            // Notify server about decline
            await api.put(`/rides/${rideId}/decline`);
            console.log('Server notified about decline');
            
        } catch (error) {
            console.error('Decline ride error:', error);
            // Keep the ride removed from local state even if server call fails
        }
    };



    return (
        <div className="driver-portal">
            <Navbar user={user} />
            
            <AnimatedContainer 
                variants={fadeIn}
                className="driver-container"
            >
                <div className="driver-header">
                    <h1 className="driver-title">
                        🚕 Driver Portal
                    </h1>
                </div>

                {/* Location Status Card */}
                <ScrollFadeIn>
                    <AnimatedCard className="location-card">
                        <div className="location-header">
                            <div>
                                <h3 className="location-title">📍 Location Status</h3>
                                <p className="location-text">
                                    {location.lat && location.lng ? 
                                        `Active at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 
                                        'Location not available'
                                    }
                                </p>
                            </div>
                            <div className={`location-status ${location.lat && location.lng ? 'online' : 'offline'}`}>
                                {location.lat && location.lng ? '🟢 Online' : '🔴 Offline'}
                            </div>
                        </div>
                    </AnimatedCard>
                </ScrollFadeIn>

                {/* Driver Stats Card */}
                <ScrollFadeIn>
                    <AnimatedCard className="driver-stats">
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-number rating">
                                    {driverStats.rating > 0 ? `${driverStats.rating}/5` : '0/5'} ⭐
                                </div>
                                <div className="stat-label">
                                    Rating ({driverStats.totalRatings} reviews)
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number rides">
                                    {driverStats.completedRides}
                                </div>
                                <div className="stat-label">
                                    Completed Rides
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number earnings">
                                    ₹{driverStats.totalEarnings}
                                </div>
                                <div className="stat-label">
                                    Total Earnings
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number monthly">
                                    ₹{driverStats.thisMonthEarnings}
                                </div>
                                <div className="stat-label">
                                    This Month
                                </div>
                            </div>
                        </div>
                    </AnimatedCard>
                </ScrollFadeIn>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    {[
                        { id: 'requests', label: '📋 Ride Requests' },
                        { id: 'active', label: '🚗 Active Rides' },
                        { id: 'history', label: '📊 Ride History' },
                        { id: 'ratings', label: '⭐ User Ratings' }
                    ].map(tab => (
                        <motion.button
                            key={tab.id}
                            variants={staggerItem}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                borderRadius: '10px',
                                backgroundColor: activeTab === tab.id ? '#667eea' : 'white',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Ride Requests Tab */}
                {activeTab === 'requests' && (
                    <ScrollFadeIn>
                        <AnimatedCard style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Incoming Ride Requests</h2>
                        
                        {rideRequests.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 30px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '15px',
                                border: '2px dashed #cbd5e1'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚕</div>
                                <h3 style={{ color: '#1e293b', marginBottom: '10px', fontSize: '1.5rem' }}>Ready for Rides!</h3>
                                <p style={{ color: '#64748b', marginBottom: '20px' }}>You're online and available. Ride requests from nearby passengers will appear here.</p>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    backgroundColor: '#dcfce7',
                                    color: '#16a34a',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    🟢 Available for Rides
                                </div>
                            </div>
                        ) : (
                            rideRequests.map(request => (
                                <motion.div 
                                    key={request._id} 
                                    variants={slideUp}
                                    initial="hidden"
                                    animate="visible"
                                    style={{
                                        backgroundColor: 'white',
                                        border: request.isPreferred ? '3px solid #f59e0b' : '2px solid #e2e8f0',
                                        borderRadius: '15px',
                                        padding: '25px',
                                        marginBottom: '20px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        position: 'relative',
                                        transition: 'all 0.3s ease'
                                    }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
                                >
                                    {request.isPreferred && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '20px',
                                            backgroundColor: '#f59e0b',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '15px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                                        }}>
                                            ⭐ PREFERRED REQUEST
                                        </div>
                                    )}
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            fontWeight: '700'
                                        }}>
                                            {request.user_id?.name ? request.user_id.name.charAt(0).toUpperCase() : '👤'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.2rem' }}>
                                                {request.user_id?.name || 'Passenger'}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#64748b' }}>
                                                <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                                                    🚗 {request.vehicle_type?.toUpperCase()}
                                                </span>
                                                <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                                                    💳 {request.payment_method?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Request Time</div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                                {request.timestamp ? new Date(request.timestamp).toLocaleTimeString() : 'Just now'}
                                            </div>
                                        </div>
                                    </div>
                                        
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: '#22c55e',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                color: 'white',
                                                marginTop: '2px'
                                            }}>
                                                📍
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>PICKUP LOCATION</div>
                                                <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                                                    {request.pickup_location?.address || 'Pickup location not specified'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: '10px', width: '2px', height: '15px', backgroundColor: '#d1d5db', marginBottom: '12px' }}></div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                color: 'white',
                                                marginTop: '2px'
                                            }}>
                                                🎯
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>DROP-OFF LOCATION</div>
                                                <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                                                    {request.drop_location?.address || 'Drop location not specified'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: '15px',
                                        marginBottom: '25px',
                                        padding: '15px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', marginBottom: '4px' }}>
                                                ₹{request.fare || 0}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Estimated Fare</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                                {request.distance ? `${request.distance} km` : 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Distance</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                                ~{request.distance ? Math.ceil(request.distance * 3) : 0} min
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Est. Duration</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => {
                                                console.log('Accept button clicked for ride:', request._id);
                                                console.log('Full request object:', request);
                                                console.log('User context:', user);
                                                acceptRide(request._id);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '12px 20px',
                                                backgroundColor: '#22c55e',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
                                        >
                                            ✅ Accept Ride
                                        </button>
                                        <button
                                            onClick={() => declineRide(request._id)}
                                            style={{
                                                padding: '12px 20px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                                        >
                                            ❌ Decline
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                        </AnimatedCard>
                    </ScrollFadeIn>
                )}

                {/* Active Rides Tab */}
                {activeTab === 'active' && (
                    <div>
                        {myRides.filter(ride => ['accepted', 'in_progress', 'driver_arrived', 'driver_arriving'].includes(ride.status)).length > 0 ? (
                            myRides.filter(ride => ['accepted', 'in_progress', 'driver_arrived', 'driver_arriving'].includes(ride.status)).map(ride => (
                                <div key={ride._id} style={{
                                    backgroundColor: 'white',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ margin: 0, color: '#2d3748' }}>Active Ride</h3>
                                        <div style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            backgroundColor: ride.status === 'accepted' ? '#fef3c7' : '#dcfce7',
                                            color: ride.status === 'accepted' ? '#d97706' : '#16a34a',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {ride.status === 'accepted' ? 'PICKUP PASSENGER' : 'RIDE IN PROGRESS'}
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <span style={{ color: '#22c55e' }}>📍</span>
                                            <span style={{ fontSize: '14px', color: '#64748b' }}>From: {ride.pickup_location?.address}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ color: '#ef4444' }}>🎯</span>
                                            <span style={{ fontSize: '14px', color: '#64748b' }}>To: {ride.drop_location?.address}</span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>{ride.user?.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Passenger</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e' }}>₹{ride.fare}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Fare</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb' }}>
                                                {ride.payment_method} {ride.payment_status === 'paid' ? '✅' : '⏳'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {ride.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {ride.status === 'accepted' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedRideForOTP(ride);
                                                    setShowOTPModal(true);
                                                    setOtpInput('');
                                                }}
                                                className="btn btn-success"
                                                style={{ flex: 1, padding: '12px' }}
                                            >
                                                🚀 Start Ride
                                            </button>
                                        )}
                                        {ride.status === 'in_progress' && (
                                            <>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            console.log('Completing ride:', ride._id);
                                                            const response = await api.put(`/rides/${ride._id}/complete`);
                                                            console.log('Complete ride response:', response.data);
                                                            if (response.data.success) {
                                                                setSelectedRideForRating(ride);
                                                                setShowRatingModal(true);
                                                                loadMyRides();
                                                            } else {
                                                                alert(response.data.error || 'Failed to complete ride');
                                                            }
                                                        } catch (error) {
                                                            console.error('Complete ride error:', error);
                                                            console.error('Error response:', error.response?.data);
                                                            alert(error.response?.data?.error || 'Failed to complete ride');
                                                        }
                                                    }}
                                                    className="btn btn-success"
                                                    style={{ flex: 1, padding: '12px' }}
                                                >
                                                    ✅ End Ride
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (ride.payment_method === 'cash') {
                                                            alert('Cash payment - collect ₹' + ride.fare + ' directly from passenger');
                                                        } else {
                                                            alert('Payment will be handled by passenger through the app. Fare: ₹' + ride.fare);
                                                        }
                                                    }}
                                                    className="btn btn-primary"
                                                    style={{ padding: '12px 20px' }}
                                                >
                                                    💳 Payment Info
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                backgroundColor: 'white',
                                padding: '60px 30px',
                                borderRadius: '15px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚗</div>
                                <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>No Active Rides</h3>
                                <p style={{ color: '#64748b' }}>Accept ride requests to see them here</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Ride History Tab */}
                {activeTab === 'history' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Ride History & Earnings</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                                    {driverStats.completedRides}
                                </div>
                                <div style={{ color: '#16a34a' }}>Completed Rides</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                                    ₹{driverStats.totalEarnings}
                                </div>
                                <div style={{ color: '#d97706' }}>Total Earnings</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                                    ₹{driverStats.thisMonthEarnings}
                                </div>
                                <div style={{ color: '#2563eb' }}>This Month</div>
                            </div>
                        </div>

                        {myRides.filter(ride => ride.status === 'completed').map(ride => (
                            <div key={ride._id} style={{
                                padding: '20px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                marginBottom: '15px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>
                                            {ride.pickup_location?.address} → {ride.drop_location?.address}
                                        </h3>
                                        <p style={{ margin: 0, color: '#64748b' }}>
                                            {new Date(ride.createdAt).toLocaleDateString()} • {ride.user?.name}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#16a34a' }}>
                                            ₹{ride.fare}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            Rating: {ride.rating || 'Not rated'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* User Ratings Tab */}
                {activeTab === 'ratings' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Ratings from Users</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                                    {driverStats.rating > 0 ? `${driverStats.rating}/5` : '0/5'} ⭐
                                </div>
                                <div style={{ color: '#d97706' }}>Average Rating</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                                    {driverStats.totalRatings}
                                </div>
                                <div style={{ color: '#16a34a' }}>Total Reviews</div>
                            </div>
                        </div>

                        {myRides.filter(ride => ride.status === 'completed' && ride.user_rating).map(ride => (
                            <div key={ride._id} style={{
                                padding: '20px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                marginBottom: '15px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                                            {ride.user_id?.name || 'Anonymous User'}
                                        </h3>
                                        <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>
                                            {new Date(ride.createdAt).toLocaleDateString()}
                                        </p>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                                            {ride.pickup_location?.address} → {ride.drop_location?.address}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', marginBottom: '5px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star} style={{ color: star <= ride.user_rating ? '#fbbf24' : '#d1d5db' }}>
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                                            {ride.user_rating}/5 stars
                                        </div>
                                    </div>
                                </div>
                                {ride.user_feedback && (
                                    <div style={{
                                        backgroundColor: '#f8fafc',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        marginTop: '10px'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#374151', fontStyle: 'italic' }}>
                                            "{ride.user_feedback}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {myRides.filter(ride => ride.status === 'completed' && ride.user_rating).length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 30px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '15px',
                                border: '2px dashed #cbd5e1'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>⭐</div>
                                <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>No Ratings Yet</h3>
                                <p style={{ color: '#64748b' }}>Complete rides to receive ratings from users</p>
                            </div>
                        )}
                    </div>
                )}

            </AnimatedContainer>

            {/* Driver Rating Modal */}
            {showRatingModal && selectedRideForRating && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Rate Your Passenger</h2>
                        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>
                            How was your experience with {selectedRideForRating.user?.name}?
                        </p>
                        
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '30px',
                                        cursor: 'pointer',
                                        color: star <= userRating ? '#fbbf24' : '#d1d5db',
                                        margin: '0 5px',
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        // Highlight stars on hover
                                        const buttons = e.target.parentElement.children;
                                        for (let i = 0; i < star; i++) {
                                            buttons[i].style.color = '#fbbf24';
                                        }
                                        for (let i = star; i < 5; i++) {
                                            buttons[i].style.color = '#d1d5db';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        // Reset to selected rating
                                        const buttons = e.target.parentElement.children;
                                        for (let i = 0; i < 5; i++) {
                                            buttons[i].style.color = (i + 1) <= userRating ? '#fbbf24' : '#d1d5db';
                                        }
                                    }}
                                >
                                    {star <= userRating ? '★' : '☆'}
                                </button>
                            ))}
                        </div>
                        
                        <textarea
                            value={userFeedback}
                            onChange={(e) => setUserFeedback(e.target.value)}
                            placeholder="Share your feedback about the passenger (optional)"
                            style={{
                                width: '100%',
                                height: '80px',
                                padding: '12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                resize: 'none'
                            }}
                        />
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowRatingModal(false);
                                    setSelectedRideForRating(null);
                                    setUserRating(0);
                                    setUserFeedback('');
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#64748b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Skip
                            </button>
                            <button
                                onClick={async () => {
                                    if (userRating === 0) {
                                        alert('Please select a rating');
                                        return;
                                    }
                                    try {
                                        await api.post(`/rides/${selectedRideForRating._id}/rate-user`, {
                                            rating: userRating,
                                            feedback: userFeedback
                                        });
                                        alert('Thank you for rating the passenger!');
                                        setShowRatingModal(false);
                                        setSelectedRideForRating(null);
                                        setUserRating(0);
                                        setUserFeedback('');
                                    } catch (error) {
                                        alert('Failed to submit rating');
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Verification Modal */}
            {showOTPModal && selectedRideForOTP && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        padding: '30px',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Enter Passenger OTP</h2>
                        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>
                            Ask the passenger for their ride OTP to start the trip
                        </p>
                        
                        <input
                            type="text"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="Enter 4-digit OTP"
                            style={{
                                width: '100%',
                                padding: '15px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '18px',
                                textAlign: 'center',
                                letterSpacing: '4px',
                                marginBottom: '20px'
                            }}
                            maxLength={4}
                        />
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await api.post(`/rides/${selectedRideForOTP._id}/regenerate-otp`);
                                        if (response.data.success) {
                                            setOtpInput('');
                                        } else {
                                            alert(response.data.error || 'Failed to regenerate OTP');
                                        }
                                    } catch (error) {
                                        alert(error.response?.data?.error || 'Failed to regenerate OTP');
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Regenerate OTP
                            </button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        setShowOTPModal(false);
                                        setSelectedRideForOTP(null);
                                        setOtpInput('');
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#64748b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (otpInput.length !== 4) {
                                            alert('Please enter a 4-digit OTP');
                                            return;
                                        }
                                        try {
                                            console.log('Verifying OTP and starting ride:', selectedRideForOTP._id);
                                            const response = await api.post(`/rides/${selectedRideForOTP._id}/verify-otp-start`, {
                                                otp: otpInput
                                            });
                                            console.log('OTP verification response:', response.data);
                                            if (response.data.success) {
                                                alert('Ride started successfully!');
                                                setShowOTPModal(false);
                                                setSelectedRideForOTP(null);
                                                setOtpInput('');
                                                loadMyRides();
                                            } else {
                                                alert(response.data.error || 'Invalid OTP');
                                            }
                                        } catch (error) {
                                            console.error('OTP verification error:', error);
                                            alert(error.response?.data?.error || 'Failed to verify OTP');
                                        }
                                    }}
                                    disabled={otpInput.length !== 4}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: otpInput.length === 4 ? '#22c55e' : '#94a3b8',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: otpInput.length === 4 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Start Ride
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}