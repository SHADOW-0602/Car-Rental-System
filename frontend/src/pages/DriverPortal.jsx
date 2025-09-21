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

    useEffect(() => {
        if (user && user._id) {
            // Clear existing requests when component mounts
            setRideRequests([]);
            
            loadRideRequests();
            loadMyRides();
            loadDriverStats();
            const cleanup = initializeSocket();
            getCurrentLocation();
            
            // Set up automatic location updates every 30 seconds
            const locationInterval = setInterval(() => {
                getCurrentLocation();
            }, 30000);
            
            return () => {
                clearInterval(locationInterval);
                if (cleanup) cleanup();
            };
        }
    }, [user]);

    const loadDriverStats = async () => {
        try {
            const response = await api.get('/ratings/driver-stats');
            if (response.data.success) {
                setDriverStats(response.data.stats);
            }
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
            query: { userId: user._id, role: 'driver' }
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
            setMyRides(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading rides:', error);
            setMyRides([]);
        }
    };

    const acceptRide = async (rideId) => {
        try {
            console.log('Attempting to accept ride:', rideId);
            
            // Validate ride ID format
            if (!rideId || typeof rideId !== 'string' || rideId.length !== 24) {
                alert('Invalid ride ID format');
                return;
            }
            
            // Immediately remove from local state to prevent double-clicking
            setRideRequests(prev => prev.filter(req => req._id !== rideId));
            
            const response = await api.put(`/rides/${rideId}/accept`);
            
            if (response.data.success) {
                alert('Ride accepted successfully!');
                loadMyRides();
                loadDriverStats();
                
                // Start location updates for live tracking
                const locationUpdateInterval = setInterval(() => {
                    getCurrentLocation();
                }, 10000); // Update every 10 seconds
                
                // Store interval ID to clear later
                window.driverLocationInterval = locationUpdateInterval;
            } else {
                alert(response.data.error || 'Failed to accept ride');
                // Reload requests if acceptance failed
                loadRideRequests();
            }
        } catch (error) {
            console.error('Accept ride error:', error);
            // Reload requests if there was an error
            loadRideRequests();
            if (error.response?.status === 404) {
                alert('Ride not found or already accepted by another driver');
            } else if (error.response?.status === 400) {
                alert(error.response.data.error || 'Invalid request');
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
                        { id: 'history', label: '📊 Ride History' }
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
                        {myRides.filter(ride => ['accepted', 'in_progress'].includes(ride.status)).length > 0 ? (
                            myRides.filter(ride => ['accepted', 'in_progress'].includes(ride.status)).map(ride => (
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
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>{ride.payment_method}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Payment</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {ride.status === 'accepted' && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.put(`/rides/${ride._id}/start`);
                                                        loadMyRides();
                                                    } catch (error) {
                                                        alert('Failed to start ride');
                                                    }
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
                                                            await api.put(`/rides/${ride._id}/complete`);
                                                            loadMyRides();
                                                        } catch (error) {
                                                            alert('Failed to complete ride');
                                                        }
                                                    }}
                                                    className="btn btn-success"
                                                    style={{ flex: 1, padding: '12px' }}
                                                >
                                                    ✅ End Ride
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const paymentUrls = {
                                                            razorpay: `https://razorpay.com/payment-links/`,
                                                            stripe: `https://dashboard.stripe.com/payments`,
                                                            paypal: `https://www.paypal.com/myaccount/transfer`,
                                                            cash: null
                                                        };
                                                        const url = paymentUrls[ride.payment_method];
                                                        if (url) {
                                                            window.open(url, '_blank');
                                                        } else {
                                                            alert('Cash payment - collect directly from passenger');
                                                        }
                                                    }}
                                                    className="btn btn-primary"
                                                    style={{ padding: '12px 20px' }}
                                                >
                                                    💳 Payment
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
                                    {myRides.filter(r => r.status === 'completed').length}
                                </div>
                                <div style={{ color: '#16a34a' }}>Completed Rides</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                                    ₹{myRides.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.fare || 0), 0)}
                                </div>
                                <div style={{ color: '#d97706' }}>Total Earnings</div>
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
                                            Rating: {ride.driver_rating || 'Not rated'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </AnimatedContainer>

        </div>
    );
}