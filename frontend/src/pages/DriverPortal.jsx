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
    const [isAvailable, setIsAvailable] = useState(true);
    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        loadRideRequests();
        loadMyRides();
        initializeSocket();
        getCurrentLocation();
    }, []);

    const initializeSocket = () => {
        const newSocket = io('http://localhost:3000', {
            query: { userId: user._id, role: 'driver' }
        });

        newSocket.on('new-ride-request', (request) => {
            setRideRequests(prev => Array.isArray(prev) ? [...prev, request] : [request]);
        });

        setSocket(newSocket);
        return () => newSocket.disconnect();
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setLocation(newLocation);
                updateLocationOnServer(newLocation);
            });
        }
    };

    const updateLocationOnServer = async (newLocation) => {
        try {
            await api.put('/users/location', {
                latitude: newLocation.lat,
                longitude: newLocation.lng
            });
            
            if (socket) {
                socket.emit('updateLocation', {
                    driverId: user._id,
                    location: newLocation
                });
            }
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const loadRideRequests = async () => {
        try {
            const response = await api.get('/rides/requests');
            setRideRequests(Array.isArray(response.data) ? response.data : []);
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
            await api.post(`/rides/${rideId}/accept`);
            alert('Ride accepted!');
            loadRideRequests();
            loadMyRides();
        } catch (error) {
            alert('Failed to accept ride');
        }
    };

    const declineRide = async (rideId) => {
        try {
            await api.post(`/rides/${rideId}/decline`);
            loadRideRequests();
        } catch (error) {
            alert('Failed to decline ride');
        }
    };

    const updateAvailability = async () => {
        try {
            const newStatus = isAvailable ? 'offline' : 'available';
            await api.put('/users/availability', { status: newStatus });
            setIsAvailable(!isAvailable);
        } catch (error) {
            alert('Failed to update availability');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <AnimatedContainer 
                variants={fadeIn}
                style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
                        🚕 Driver Portal
                        {user?.driverInfo?.isVerified && <VerifiedBadge isVerified={true} size="medium" />}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <AnimatedButton
                            onClick={updateAvailability}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: isAvailable ? '#22c55e' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            {isAvailable ? '🟢 Available' : '🔴 Offline'}
                        </AnimatedButton>
                        <AnimatedButton
                            onClick={getCurrentLocation}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            📍 Update Location
                        </AnimatedButton>
                    </div>
                </div>

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
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚕</div>
                                <p>No ride requests at the moment</p>
                            </div>
                        ) : (
                            rideRequests.map(request => (
                                <motion.div 
                                    key={request._id} 
                                    variants={slideUp}
                                    initial="hidden"
                                    animate="visible"
                                    style={{
                                        padding: '20px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        marginBottom: '15px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 10px 0' }}>
                                                {request.pickup_location?.address} → {request.drop_location?.address}
                                            </h3>
                                            <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>
                                                Passenger: {request.user?.name}
                                            </p>
                                            <p style={{ margin: 0, color: '#64748b' }}>
                                                Estimated Fare: ₹{request.estimated_fare}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <AnimatedButton
                                                onClick={() => acceptRide(request._id)}
                                                style={{
                                                    padding: '10px 20px',
                                                    backgroundColor: '#22c55e',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Accept
                                            </AnimatedButton>
                                            <AnimatedButton
                                                onClick={() => declineRide(request._id)}
                                                style={{
                                                    padding: '10px 20px',
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Decline
                                            </AnimatedButton>
                                        </div>
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