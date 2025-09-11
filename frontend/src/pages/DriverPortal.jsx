import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import VerifiedBadge from '../components/VerifiedBadge';
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
            loadRideRequests();
            loadMyRides();
            loadDriverStats();
            initializeSocket();
            getCurrentLocation();
            
            // Set up automatic location updates every 30 seconds
            const locationInterval = setInterval(() => {
                getCurrentLocation();
            }, 30000);
            
            return () => clearInterval(locationInterval);
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
                setRideRequests(prev => {
                    const existing = Array.isArray(prev) ? prev : [];
                    const alreadyExists = existing.some(req => req._id === newRequest._id);
                    return alreadyExists ? existing : [...existing, newRequest];
                });
            }
        });

        newSocket.on('connect', () => {
            console.log('Driver connected to server');
        });

        newSocket.on('disconnect', () => {
            console.log('Driver disconnected from server');
        });

        setSocket(newSocket);
        return () => newSocket.disconnect();
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
            const response = await api.get('/rides/requests');
            const requests = response.data.requests || response.data || [];
            setRideRequests(Array.isArray(requests) ? requests : []);
        } catch (error) {
            console.error('Error loading requests:', error);
            setRideRequests([]);
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
            const response = await api.put(`/rides/${rideId}/accept`);
            if (response.data.success) {
                alert('Ride accepted!');
                // Remove from requests and add to active rides
                setRideRequests(prev => prev.filter(req => req._id !== rideId));
                loadMyRides();
                loadDriverStats();
            }
        } catch (error) {
            console.error('Accept ride error:', error);
            alert(error.response?.data?.error || 'Failed to accept ride');
        }
    };

    const declineRide = (rideId) => {
        // Simply remove from local state for decline
        setRideRequests(prev => prev.filter(req => req._id !== rideId));
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
                            <div className="request-empty">
                                <div className="request-empty-icon">🚕</div>
                                <h3 className="request-empty-title">You're Online!</h3>
                                <p className="request-empty-text">Waiting for ride requests in your area...</p>
                                <div className="request-status">
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
                                    className={`request-card ${request.isPreferred ? 'preferred' : ''}`}
                                >
                                    {request.isPreferred && (
                                        <div className="preferred-badge">
                                            ⭐ PREFERRED
                                        </div>
                                    )}
                                    
                                    <div className="request-user">
                                        <div className="request-avatar">
                                            {request.user_id?.name ? request.user_id.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h3 className="request-user-name">
                                                {request.user_id?.name || 'Passenger'}
                                            </h3>
                                            <p className="request-user-meta">
                                                {request.vehicle_type?.toUpperCase()} • {request.payment_method?.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                        
                                    <div className="request-route">
                                        <div className="route-item">
                                            <span className="route-icon">📍</span>
                                            <span className="route-text">
                                                {request.pickup_location?.address || 'Pickup location'}
                                            </span>
                                        </div>
                                        <div className="route-item">
                                            <span className="route-icon destination">🎯</span>
                                            <span className="route-text">
                                                {request.drop_location?.address || 'Drop location'}
                                            </span>
                                        </div>
                                    </div>
                                        
                                    <div className="request-details">
                                        <div className="request-pricing">
                                            <div className="price-item">
                                                <div className="price-value">
                                                    ₹{request.fare || 0}
                                                </div>
                                                <div className="price-label">Estimated Fare</div>
                                            </div>
                                            <div className="price-item">
                                                <div className="distance-value">
                                                    {request.distance ? `${request.distance} km` : 'N/A'}
                                                </div>
                                                <div className="price-label">Distance</div>
                                            </div>
                                        </div>
                                        <div className="request-time">
                                            {request.timestamp ? new Date(request.timestamp).toLocaleTimeString() : 'Just now'}
                                        </div>
                                    </div>
                                    
                                    <div className="request-actions">
                                        <button
                                            onClick={() => acceptRide(request._id)}
                                            className="accept-btn"
                                        >
                                            ✅ Accept Ride
                                        </button>
                                        <button
                                            onClick={() => declineRide(request._id)}
                                            className="decline-btn"
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
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Active Rides</h2>
                        
                        {myRides.filter(ride => ['accepted', 'in_progress'].includes(ride.status)).map(ride => (
                            <div key={ride._id} style={{
                                padding: '20px',
                                border: '2px solid #22c55e',
                                borderRadius: '10px',
                                marginBottom: '15px',
                                backgroundColor: '#f0fdf4'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 10px 0' }}>
                                            {ride.pickup_location?.address} → {ride.drop_location?.address}
                                        </h3>
                                        <p style={{ margin: '0 0 5px 0' }}>
                                            Passenger: {ride.user?.name} • {ride.user?.phone}
                                        </p>
                                        <p style={{ margin: 0, color: '#16a34a', fontWeight: '600' }}>
                                            Status: {ride.status.toUpperCase()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button style={{
                                            padding: '10px 15px',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}>
                                            📞 Call
                                        </button>
                                        <button style={{
                                            padding: '10px 15px',
                                            backgroundColor: '#f59e0b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}>
                                            🗺️ Navigate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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