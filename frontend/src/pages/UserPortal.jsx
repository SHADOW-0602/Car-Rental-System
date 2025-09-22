import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import Navbar from '../components/Navbar';
import MapPicker from '../components/MapPicker';
import api from '../services/api';


import { haversineDistance } from '../utils/distance';
import { fadeIn, slideUp, staggerContainer, staggerItem, scaleIn } from '../animations/variants';
import { AnimatedButton, AnimatedCard, AnimatedContainer } from '../animations/AnimatedComponents';


export default function UserPortal({ user: propUser }) {
    const { user: contextUser } = useAuthContext();
    const { trackOperation } = useAnalyticsContext();
    const user = propUser || contextUser;
    const [searchData, setSearchData] = useState({
        pickup: '',
        destination: ''
    });
    const [pickupLocation, setPickupLocation] = useState(null);
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [rideHistory, setRideHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('book');

    const handlePickupSelect = (location) => {
        setPickupLocation(location);
        if (location) {
            setSearchData(prev => ({ ...prev, pickup: location.address }));
            trackOperation({
                type: 'PICKUP_LOCATION_SELECTED',
                details: { address: location.address, coordinates: { lat: location.latitude, lng: location.longitude } }
            });
            if (destinationLocation) {
                const calculatedDistance = haversineDistance(
                    location.latitude,
                    location.longitude,
                    destinationLocation.latitude,
                    destinationLocation.longitude
                );
                setDistance(calculatedDistance);
            }
        } else {
            setSearchData(prev => ({ ...prev, pickup: '' }));
            setDistance(0);
        }
    };

    const handleDestinationSelect = (location) => {
        setDestinationLocation(location);
        if (location) {
            setSearchData(prev => ({ ...prev, destination: location.address }));
            trackOperation({
                type: 'DESTINATION_LOCATION_SELECTED',
                details: { address: location.address, coordinates: { lat: location.latitude, lng: location.longitude } }
            });
            if (pickupLocation) {
                const calculatedDistance = haversineDistance(
                    pickupLocation.latitude,
                    pickupLocation.longitude,
                    location.latitude,
                    location.longitude
                );
                setDistance(calculatedDistance);
            }
        } else {
            setSearchData(prev => ({ ...prev, destination: '' }));
            setDistance(0);
        }
    };

    const [bookingStep, setBookingStep] = useState('locations');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [ridePin, setRidePin] = useState(null);
    const [rideDetails, setRideDetails] = useState(null);
    const [pollInterval, setPollInterval] = useState(null);
    const [distance, setDistance] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [searchingDriver, setSearchingDriver] = useState(false);
    const [searchProgress, setSearchProgress] = useState(0);

    // Fetch ride history and set up live updates
    useEffect(() => {
        if (user) {
            fetchRideHistory();
            
            // Set up polling for live ride updates
            const rideUpdateInterval = setInterval(() => {
                if (rideDetails && ['accepted', 'in_progress'].includes(rideDetails.status)) {
                    fetchRideStatus(rideDetails._id);
                }
            }, 15000); // Update every 15 seconds
            
            return () => clearInterval(rideUpdateInterval);
        }
    }, [user, rideDetails]);
    
    const fetchRideStatus = async (rideId) => {
        try {
            const response = await api.get(`/rides/${rideId}/status`);
            if (response.data.success) {
                setRideDetails(response.data.ride);
            }
        } catch (error) {
            console.error('Failed to fetch ride status:', error);
        }
    };

    const fetchRideHistory = async () => {
        try {
            const response = await api.get('/rides/user');
            if (response.data.success) {
                setRideHistory(response.data.rides);
                trackOperation({
                    type: 'RIDE_HISTORY_VIEWED',
                    details: { totalRides: response.data.rides.length }
                });
            }
        } catch (error) {
            console.error('Failed to fetch ride history:', error);
        }
    };

    const handleBookRide = () => {
        if (!user) {
            trackOperation({
                type: 'SIGNUP_REDIRECT_FROM_BOOKING',
                details: { hasLocations: !!(pickupLocation && destinationLocation) }
            });
            if (pickupLocation && destinationLocation) {
                window.location.href = '/signup';
            } else {
                window.location.href = '/signup';
            }
        } else {
            if (pickupLocation && destinationLocation) {
                trackOperation({
                    type: 'VEHICLE_SELECTION_STARTED',
                    details: { distance: distance.toFixed(1) }
                });
                setBookingStep('vehicles');
            } else {
                alert('Please select both pickup and destination locations');
            }
        }
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        trackOperation({
            type: 'VEHICLE_SELECTED',
            details: { vehicleType: vehicle.type, estimatedFare: vehicle.estimatedFare, distance: vehicle.distance }
        });
        // Skip payment step and go directly to searching like Uber
        handleRideRequest(vehicle, 'cash'); // Default to cash, can be changed later
    };

    const handleRideRequest = async (vehicle, paymentMethod = 'cash') => {
        try {
            trackOperation({
                type: 'RIDE_REQUEST_STARTED',
                details: { vehicleType: vehicle.type, estimatedFare: vehicle.estimatedFare, paymentMethod }
            });
            
            setBookingStep('searching');
            setSearchingDriver(true);
            setSearchProgress(0);
            
            // Create ride request immediately
            const rideData = {
                pickup_location: {
                    address: pickupLocation.address,
                    latitude: pickupLocation.latitude,
                    longitude: pickupLocation.longitude
                },
                drop_location: {
                    address: destinationLocation.address,
                    latitude: destinationLocation.latitude,
                    longitude: destinationLocation.longitude
                },
                vehicle_type: vehicle.type,
                payment_method: paymentMethod
            };
            
            const response = await api.post('/rides/request', rideData);
            
            if (response.data.success) {
                const rideId = response.data.ride._id;
                console.log('Ride created successfully:', { rideId, status: response.data.ride.status });
                
                if (!rideId) {
                    throw new Error('Invalid ride ID received from server');
                }
                
                // Set up real-time polling for driver acceptance
                const pollForDriverAcceptance = setInterval(async () => {
                    try {
                        const statusResponse = await api.get(`/rides/${rideId}/status`);
                        if (statusResponse.data.success && statusResponse.data.ride) {
                            const rideStatus = statusResponse.data.ride;
                            
                            if (rideStatus.status === 'accepted') {
                                clearInterval(pollForDriverAcceptance);
                                setSearchingDriver(false);
                                setBookingStep('confirmed');
                                setRideDetails(rideStatus);
                                fetchRideHistory();
                                
                                trackOperation({
                                    type: 'RIDE_BOOKING_SUCCESS',
                                    details: { rideId, paymentMethod, fare: vehicle.estimatedFare }
                                });
                            } else if (rideStatus.status === 'cancelled') {
                                clearInterval(pollForDriverAcceptance);
                                setSearchingDriver(false);
                                setBookingStep('error');
                            }
                        }
                    } catch (error) {
                        console.error('Error polling ride status:', error);
                    }
                }, 3000);
                
                // Auto-cancel after 5 minutes if no driver accepts
                setTimeout(() => {
                    clearInterval(pollForDriverAcceptance);
                    if (searchingDriver) {
                        setSearchingDriver(false);
                        setBookingStep('error');
                    }
                }, 300000);
                
            } else {
                console.error('Ride creation failed:', response.data);
                throw new Error(response.data.message || 'Failed to create ride request');
            }
        } catch (error) {
            console.error('Failed to create ride:', error);
            setSearchingDriver(false);
            setBookingStep('error');
            trackOperation({
                type: 'RIDE_BOOKING_ERROR',
                details: { error: error.message }
            });
        }
    };

    const resetBooking = () => {
        trackOperation({
            type: 'BOOKING_RESET',
            details: { previousStep: bookingStep }
        });
        
        // Clear any active polling
        if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
        }
        
        setBookingStep('locations');
        setSelectedVehicle(null);
        setRidePin(null);
        setRideDetails(null);
        setPickupLocation(null);
        setDestinationLocation(null);
        setSearchData({ pickup: '', destination: '' });
        setDistance(0);
        setSearchingDriver(false);
        setSearchProgress(0);
    };

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <Navbar user={user} />
                
                {/* Hero Section */}
                <AnimatedContainer
                    variants={fadeIn}
                    style={{
                        backgroundImage: 'url(/assets/background.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white',
                        padding: '100px 20px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.7)',
                        zIndex: -1
                    }}></div>
                    <motion.h1 
                        variants={slideUp}
                        style={{ 
                            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
                            fontWeight: '900', 
                            marginBottom: '24px', 
                            textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.1',
                            color: '#ffffff'
                        }}
                    >
                        UrbanFleet
                    </motion.h1>
                    <motion.div 
                        variants={slideUp}
                        style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '600', 
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: '#ffffff',
                            textShadow: '1px 1px 4px rgba(0,0,0,0.8)'
                        }}
                    >
                        Premium Car Rental
                    </motion.div>
                    <motion.p 
                        variants={slideUp}
                        style={{ 
                            fontSize: '1.2rem', 
                            marginBottom: '50px', 
                            maxWidth: '580px', 
                            margin: '0 auto 50px',
                            lineHeight: '1.6',
                            fontWeight: '400',
                            color: '#ffffff',
                            textShadow: '1px 1px 4px rgba(0,0,0,0.8)'
                        }}
                    >
                        Experience luxury transportation with our premium fleet of vehicles. Safe, reliable, and affordable rides at your fingertips.
                    </motion.p>
                    
                    <motion.div 
                        variants={staggerContainer}
                        style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <motion.a 
                            variants={staggerItem}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/login" 
                            className="btn btn-primary"
                            style={{
                                padding: '16px 32px',
                                fontSize: '16px',
                                fontWeight: '600',
                                letterSpacing: '0.025em',
                                textDecoration: 'none',
                                display: 'inline-block',
                                width: '160px',
                                textAlign: 'center'
                            }}
                        >
                            Sign In
                        </motion.a>
                        <motion.a 
                            variants={staggerItem}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/signup" 
                            className="btn btn-success"
                            style={{
                                padding: '16px 32px',
                                fontSize: '16px',
                                fontWeight: '600',
                                letterSpacing: '0.025em',
                                textDecoration: 'none',
                                display: 'inline-block',
                                width: '160px',
                                textAlign: 'center'
                            }}
                        >
                            Get Started
                        </motion.a>
                    </motion.div>
                </AnimatedContainer>

                {/* Quick Booking Section */}
                <AnimatedContainer 
                    variants={slideUp}
                    style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 60px' }}
                >
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        padding: '40px',
                        borderRadius: '25px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 style={{ 
                                fontSize: '2.25rem', 
                                fontWeight: '800', 
                                color: '#1f2937', 
                                marginBottom: '16px',
                                letterSpacing: '-0.025em'
                            }}>
                                Experience Our Platform
                            </h2>
                            <p style={{ 
                                color: '#6b7280', 
                                fontSize: '1.125rem',
                                maxWidth: '480px',
                                margin: '0 auto',
                                lineHeight: '1.6'
                            }}>
                                See how easy it is to book premium transportation
                            </p>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                            {/* Pickup Demo */}
                            <div>
                                <h3 style={{ color: '#2d3748', marginBottom: '15px', fontSize: '1.1rem' }}>
                                    📍 Pickup Location
                                </h3>
                                <MapPicker
                                    onLocationSelect={handlePickupSelect}
                                    placeholder="Try searching for your location..."
                                    autoLocate={true}
                                />
                                {pickupLocation && (
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '15px',
                                        backgroundColor: '#f0f9ff',
                                        borderRadius: '12px',
                                        border: '1px solid #0ea5e9'
                                    }}>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#0c4a6e', fontSize: '14px' }}>Selected Pickup:</p>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{pickupLocation.address}</p>
                                    </div>
                                )}
                            </div>

                            {/* Destination Demo */}
                            <div>
                                <h3 style={{ color: '#2d3748', marginBottom: '15px', fontSize: '1.1rem' }}>
                                    🎯 Destination
                                </h3>
                                <MapPicker
                                    onLocationSelect={handleDestinationSelect}
                                    placeholder="Where would you like to go?"
                                    autoLocate={false}
                                />
                                {destinationLocation && (
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '15px',
                                        backgroundColor: '#fef3c7',
                                        borderRadius: '12px',
                                        border: '1px solid #f59e0b'
                                    }}>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#92400e', fontSize: '14px' }}>Selected Destination:</p>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{destinationLocation.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <button
                                onClick={handleBookRide}
                                className="btn btn-primary"
                                style={{
                                    padding: '16px 32px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    letterSpacing: '0.025em'
                                }}
                            >
                                {pickupLocation && destinationLocation ? 'Sign Up to See Pricing' : 'Try Our Platform'}
                            </button>
                            {pickupLocation && destinationLocation && (
                                <p style={{ marginTop: '15px', color: '#64748b', fontSize: '14px' }}>
                                    💡 Distance: {haversineDistance(pickupLocation.latitude, pickupLocation.longitude, destinationLocation.latitude, destinationLocation.longitude).toFixed(1)} km - Sign up to see pricing
                                </p>
                            )}
                        </div>
                    </div>
                </AnimatedContainer>

                {/* Enhanced Features Showcase */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <motion.h2 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{ 
                                fontSize: 'clamp(2rem, 4vw, 3rem)', 
                                fontWeight: '800', 
                                color: '#1f2937', 
                                marginBottom: '24px',
                                letterSpacing: '-0.025em'
                            }}
                        >
                            Why Choose UrbanFleet
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ 
                                fontSize: '1.125rem', 
                                color: '#6b7280', 
                                maxWidth: '560px', 
                                margin: '0 auto',
                                lineHeight: '1.7'
                            }}
                        >
                            Premium transportation solutions powered by cutting-edge technology and exceptional service
                        </motion.p>
                    </div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '80px' }}
                    >
                        <motion.div 
                            variants={staggerItem}
                            whileHover={{ scale: 1.05, rotateY: 5 }}
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                        >
                            <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                style={{ fontSize: '80px', marginBottom: '20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            >
                                ⚡
                            </motion.div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px', letterSpacing: '-0.025em' }}>Lightning Fast Booking</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: '0.95rem' }}>Book your ride in under 30 seconds with our streamlined booking process. Real-time driver matching and instant confirmations.</p>
                        </motion.div>
                        
                        <motion.div 
                            variants={staggerItem}
                            whileHover={{ scale: 1.05, rotateY: -5 }}
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                        >
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                                style={{ fontSize: '80px', marginBottom: '20px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            >
                                🛡️
                            </motion.div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px', letterSpacing: '-0.025em' }}>100% Safe & Secure</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: '0.95rem' }}>All drivers are thoroughly vetted and background-checked. GPS tracking, emergency support, and secure payment processing.</p>
                        </motion.div>
                        
                        <motion.div 
                            variants={staggerItem}
                            whileHover={{ scale: 1.05, rotateX: 5 }}
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                        >
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                                style={{ fontSize: '80px', marginBottom: '20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            >
                                💰
                            </motion.div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px', letterSpacing: '-0.025em' }}>Transparent Pricing</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: '0.95rem' }}>No hidden fees, no surge pricing surprises. Upfront pricing with multiple payment options and loyalty rewards.</p>
                        </motion.div>
                    </motion.div>

                    {/* Vehicle Fleet with Parallax Effect */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                    >
                        <motion.h2 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ 
                                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', 
                                fontWeight: '800', 
                                color: '#1f2937', 
                                marginBottom: '24px',
                                letterSpacing: '-0.025em'
                            }}
                        >
                            Our Premium Fleet
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ fontSize: '1.125rem', color: '#6b7280', lineHeight: '1.6' }}
                        >
                            Choose from our diverse range of vehicles for every occasion
                        </motion.p>
                    </motion.div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '80px' }}
                    >
                        <motion.div 
                            variants={staggerItem}
                            whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                            style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                        >
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                style={{ height: '200px', backgroundImage: 'url(/assets/Economy.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' }}></div>
                            </motion.div>
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', letterSpacing: '-0.025em' }}>Economy Cars</h3>
                                <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.6' }}>Perfect for daily commutes and city travel. Fuel-efficient and budget-friendly.</p>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#22c55e' }}>₹20 base + ₹8/km</div>
                            </div>
                        </motion.div>

                        <motion.div 
                            variants={staggerItem}
                            whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                            style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                        >
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                style={{ height: '200px', backgroundImage: 'url(/assets/SUV.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.3) 100%)' }}></div>
                            </motion.div>
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', letterSpacing: '-0.025em' }}>Premium SUVs</h3>
                                <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.6' }}>Spacious and comfortable for families and groups. Premium amenities included.</p>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#22c55e' }}>₹20 base + ₹18/km</div>
                            </div>
                        </motion.div>

                        <motion.div 
                            variants={staggerItem}
                            whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                            style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                        >
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                style={{ height: '200px', backgroundImage: 'url(/assets/Luxury.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.3) 100%)' }}></div>
                            </motion.div>
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', letterSpacing: '-0.025em' }}>Luxury Vehicles</h3>
                                <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.6' }}>Executive travel with style. Premium interiors and professional chauffeurs.</p>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#22c55e' }}>₹20 base + ₹25/km</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* New Dynamic Stats Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '30px',
                            padding: '60px 40px',
                            textAlign: 'center',
                            color: 'white',
                            marginBottom: '80px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '60px', opacity: 0.1 }}
                        >
                            🌟
                        </motion.div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '50px' }}>Live Statistics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                    style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}
                                >
                                    50K+
                                </motion.div>
                                <p style={{ opacity: 0.9 }}>Happy Customers</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                    style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}
                                >
                                    1M+
                                </motion.div>
                                <p style={{ opacity: 0.9 }}>Rides Completed</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}
                                >
                                    4.9★
                                </motion.div>
                                <p style={{ opacity: 0.9 }}>Average Rating</p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Enhanced Call to Action */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        style={{
                        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                        borderRadius: '30px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        border: '2px solid #e2e8f0',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <motion.div 
                            animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ fontSize: '60px', marginBottom: '20px' }}
                        >
                            🎆
                        </motion.div>
                        <motion.div 
                            animate={{ x: [0, 100, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '30px', opacity: 0.3 }}
                        >
                            ✨
                        </motion.div>
                        <motion.div 
                            animate={{ x: [0, -80, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                            style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '25px', opacity: 0.3 }}
                        >
                            🌟
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}
                        >
                            Ready to Experience Premium Transportation?
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}
                        >
                            Join thousands of satisfied customers who trust UrbanFleet for their daily transportation needs.
                        </motion.p>
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
                        >
                            <motion.a 
                                whileHover={{ scale: 1.05, boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)' }}
                                whileTap={{ scale: 0.95 }}
                                href="/signup" 
                                style={{
                                    padding: '18px 40px',
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '50px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                🚀 Sign Up Free
                            </motion.a>
                            <motion.a 
                                whileHover={{ scale: 1.05, boxShadow: '0 12px 35px rgba(34, 197, 94, 0.6)' }}
                                whileTap={{ scale: 0.95 }}
                                href="/driver/register" 
                                style={{
                                    padding: '18px 40px',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '50px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                🚕 Become a Driver
                            </motion.a>
                        </motion.div>
                    </motion.div>
                </motion.div>
                
                {/* FAQ Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        maxWidth: '1200px',
                        margin: '80px auto 0',
                        padding: '0 20px'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                            Frequently asked questions
                        </h2>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '15px' }}>
                                How does UrbanFleet work?
                            </h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                UrbanFleet is a platform where those looking to travel can connect with driver-partners looking to earn.
                            </p>
                        </div>
                        
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '15px' }}>
                                What are the requirements to drive?
                            </h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                You must be at least 21 years old, have a valid driver's license, and pass our background check.
                            </p>
                        </div>
                        
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '15px' }}>
                                How do I pay for my ride?
                            </h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                You can pay with credit/debit cards, digital wallets, or cash directly to the driver.
                            </p>
                        </div>
                        
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '15px' }}>
                                Can I schedule a ride in advance?
                            </h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                Yes, you can schedule rides up to 30 days in advance through our Reserve feature.
                            </p>
                        </div>
                        
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '15px' }}>
                                What safety measures are in place?
                            </h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                All drivers are background-checked, vehicles are inspected, and rides are tracked with GPS.
                            </p>
                        </div>
                        
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '15px' }}>
                                How do I contact customer support?
                            </h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                You can reach us through the Help section in the app or visit our Contact page.
                            </p>
                        </div>
                    </div>
                </motion.div>
                
                {/* Enhanced Live Chat Support */}
                <motion.div 
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}
                >
                    {!showChat && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{ y: [0, -3, 0] }}
                            transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                            onClick={() => setShowChat(true)}
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            💬
                        </motion.button>
                    )}
                    
                    {showChat && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowChat(false)}
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1001
                                }}
                            >
                                ×
                            </button>
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                width: '280px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Need Help?</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px' }}>
                                    Please sign up or log in to access our AI chat support.
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <a href="/login" className="btn btn-primary" style={{
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        textDecoration: 'none'
                                    }}>Login</a>
                                    <a href="/signup" className="btn btn-success" style={{
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        textDecoration: 'none'
                                    }}>Sign Up</a>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Footer */}
                <footer style={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    padding: '60px 20px 20px',
                    marginTop: '80px'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '40px',
                            marginBottom: '40px'
                        }}>
                            <div>
                                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>UrbanFleet</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}><a href="/help" style={{ color: '#d1d5db', textDecoration: 'none' }}>Visit Help Center</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Company</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}><a href="/about" style={{ color: '#d1d5db', textDecoration: 'none' }}>About us</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/services" style={{ color: '#d1d5db', textDecoration: 'none' }}>Our offerings</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/news" style={{ color: '#d1d5db', textDecoration: 'none' }}>Newsroom</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/investors" style={{ color: '#d1d5db', textDecoration: 'none' }}>Investors</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/blog" style={{ color: '#d1d5db', textDecoration: 'none' }}>Blog</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/careers" style={{ color: '#d1d5db', textDecoration: 'none' }}>Careers</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Products</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}><a href="/ride" style={{ color: '#d1d5db', textDecoration: 'none' }}>Ride</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/driver/register" style={{ color: '#d1d5db', textDecoration: 'none' }}>Drive</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/business" style={{ color: '#d1d5db', textDecoration: 'none' }}>UrbanFleet for Business</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/gift-cards" style={{ color: '#d1d5db', textDecoration: 'none' }}>Gift cards</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Global citizenship</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}><a href="/safety" style={{ color: '#d1d5db', textDecoration: 'none' }}>Safety</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/sustainability" style={{ color: '#d1d5db', textDecoration: 'none' }}>Sustainability</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Travel</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}><a href="/reserve" style={{ color: '#d1d5db', textDecoration: 'none' }}>Reserve</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/airports" style={{ color: '#d1d5db', textDecoration: 'none' }}>Airports</a></li>
                                    <li style={{ marginBottom: '12px' }}><a href="/cities" style={{ color: '#d1d5db', textDecoration: 'none' }}>Cities</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style={{
                            borderTop: '1px solid #374151',
                            paddingTop: '30px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                <span style={{ color: '#d1d5db' }}>English</span>
                                <span style={{ color: '#d1d5db' }}>Delhi NCR</span>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <a href="https://www.linkedin.com/in/kushagra-singh-539542311/" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/linkedin.png" alt="LinkedIn" style={{ width: '24px', height: '24px' }} />
                                </a>
                                <a href="https://x.com/Odin_Boi_0602" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/twitter.png" alt="X" style={{ width: '24px', height: '24px' }} />
                                </a>
                                <a href="https://github.com/SHADOW-0602" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/github.png" alt="GitHub" style={{ width: '24px', height: '24px' }} />
                                </a>
                            </div>
                        </div>
                        
                        <div style={{
                            marginTop: '20px',
                            paddingTop: '20px',
                            borderTop: '1px solid #374151',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '20px'
                        }}>
                            <span style={{ color: '#9ca3af', fontSize: '14px' }}>© 2025 UrbanFleet Technologies Inc.</span>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Privacy</a>
                                <a href="/accessibility" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Accessibility</a>
                                <a href="/terms" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Terms</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            {/* Authenticated User Content */}
            <AnimatedContainer 
                variants={fadeIn}
                style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
                    Welcome back, {user.name}! 🚗
                </h1>
                
                {/* Tab Navigation */}
                <div className="tab-navigation" style={{ marginBottom: '30px' }}>
                    <button 
                        onClick={() => {
                            setActiveTab('book');
                            trackOperation({ type: 'TAB_SWITCHED', details: { tab: 'book' } });
                        }}
                        className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
                    >
                        🚗 Book Ride
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('history');
                            fetchRideHistory();
                            trackOperation({ type: 'TAB_SWITCHED', details: { tab: 'history' } });
                        }}
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    >
                        📋 Ride History
                    </button>
                </div>
                
                {/* Booking Form for Authenticated Users */}
                {activeTab === 'book' && (
                <AnimatedCard style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
                    <h2 style={{ marginBottom: '30px', color: '#2d3748' }}>Book Your Ride</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                        {/* Pickup Map */}
                        <div>
                            <h3 style={{ color: '#2d3748', marginBottom: '20px' }}>📍 Pickup Location</h3>
                            <MapPicker
                                onLocationSelect={handlePickupSelect}
                                placeholder="Search for pickup location..."
                                autoLocate={true}
                            />
                            {pickupLocation && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '15px',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '10px',
                                    border: '1px solid #0ea5e9'
                                }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#0c4a6e' }}>Selected Pickup:</p>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{pickupLocation.address}</p>
                                </div>
                            )}
                        </div>

                        {/* Destination Map */}
                        <div>
                            <h3 style={{ color: '#2d3748', marginBottom: '20px' }}>🎯 Drop-off Location</h3>
                            <MapPicker
                                onLocationSelect={handleDestinationSelect}
                                placeholder="Search for destination..."
                                autoLocate={false}
                            />
                            {destinationLocation && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '15px',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '10px',
                                    border: '1px solid #f59e0b'
                                }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#92400e' }}>Selected Destination:</p>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{destinationLocation.address}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {bookingStep === 'locations' && (
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button
                                onClick={handleBookRide}
                                disabled={!pickupLocation || !destinationLocation}
                                className={`btn ${(!pickupLocation || !destinationLocation) ? '' : 'btn-success'}`}
                                style={{
                                    padding: '15px 40px',
                                    fontSize: '18px',
                                    cursor: (!pickupLocation || !destinationLocation) ? 'not-allowed' : 'pointer',
                                    opacity: (!pickupLocation || !destinationLocation) ? '0.6' : '1'
                                }}
                            >
                                🚀 Choose Vehicle
                            </button>
                        </div>
                    )}

                    {bookingStep === 'vehicles' && (
                        <motion.div 
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            style={{ marginTop: '30px' }}
                        >
                            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3748' }}>Choose Your Vehicle</h3>
                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '10px', border: '1px solid #0ea5e9' }}>
                                <p style={{ margin: '0', color: '#0c4a6e', fontWeight: '600' }}>Distance: {distance.toFixed(1)} km</p>
                            </div>
                            <motion.div 
                                variants={staggerContainer}
                                style={{ display: 'grid', gap: '15px' }}
                            >
                                {[
                                    { type: 'bike', name: 'Bike', icon: '🏍️', price: 8, time: '2-5 min' },
                                    { type: 'sedan', name: 'Sedan', icon: '🚗', price: 12, time: '3-7 min' },
                                    { type: 'suv', name: 'SUV', icon: '🚙', price: 18, time: '5-10 min' }
                                ].map(vehicle => {
                                    const baseFare = 20;
                                    const estimatedFare = Math.round(baseFare + (vehicle.price * distance));
                                    return (
                                        <motion.div 
                                            key={vehicle.type} 
                                            variants={staggerItem}
                                            whileHover={{ scale: 1.02, borderColor: '#667eea' }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '20px',
                                                border: '2px solid #e2e8f0',
                                                borderRadius: '15px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => handleVehicleSelect({...vehicle, estimatedFare, distance})}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
                                                    {vehicle.type === 'bike' ? (
                                                        <img src="/assets/Bike Symbol.png" alt="Bike" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                                    ) : (
                                                        vehicle.icon
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>{vehicle.name}</h4>
                                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{vehicle.time}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>₹{estimatedFare}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>₹20 base + ₹{vehicle.price}/km</div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <button onClick={() => setBookingStep('locations')} className="btn btn-secondary" style={{
                                    padding: '10px 20px'
                                }}>Back</button>
                            </div>
                        </motion.div>
                    )}

                    {bookingStep === 'confirmed' && rideDetails && (
                        <motion.div 
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            style={{ marginTop: '30px' }}
                        >
                            <div style={{
                                backgroundColor: 'white',
                                padding: '30px',
                                borderRadius: '15px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                marginBottom: '20px'
                            }}>
                                {/* Live Driver Location */}
                                {rideDetails.status === 'accepted' && (
                                    <div style={{
                                        backgroundColor: '#f0f9ff',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        marginBottom: '20px',
                                        border: '1px solid #0ea5e9'
                                    }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>📍 Live Driver Location</h4>
                                        <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
                                            Driver is {rideDetails.driver_info?.distance_from_user || '0'} km away
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                                            ETA: {rideDetails.driver_info?.eta || '5'} minutes
                                        </div>
                                    </div>
                                )}
                                
                                {rideDetails.status === 'in_progress' && (
                                    <div style={{
                                        backgroundColor: '#dcfce7',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        marginBottom: '20px',
                                        border: '1px solid #16a34a'
                                    }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>🚗 Ride in Progress</h4>
                                        <div style={{ fontSize: '14px', color: '#15803d' }}>
                                            You are currently on your way to destination
                                        </div>
                                    </div>
                                )}
                                {/* Success Header */}
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '25px',
                                    paddingBottom: '15px',
                                    borderBottom: '2px solid #f1f5f9'
                                }}>
                                    <div style={{ fontSize: '64px', marginBottom: '15px' }}>✅</div>
                                    <h2 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>Ride Confirmed!</h2>
                                    <p style={{ margin: 0, color: '#64748b' }}>Your driver is on the way</p>
                                </div>

                                {/* Driver Information */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>👨💼 Your Driver</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            backgroundColor: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px'
                                        }}>👨💼</div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>{rideDetails.driver_info?.name}</h4>
                                            <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>
                                                ⭐ {rideDetails.driver_info?.rating} • {rideDetails.driver_info?.vehicle_number}
                                            </p>
                                            <p style={{ margin: 0, color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>
                                                📍 {rideDetails.driver_info?.distance_from_user} km away • ETA: {rideDetails.driver_info?.eta} min
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <a href={`tel:${rideDetails.driver_info?.phone}`} style={{
                                                display: 'inline-block',
                                                padding: '8px 12px',
                                                backgroundColor: '#22c55e',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px'
                                            }}>📞 Call</a>
                                        </div>
                                    </div>
                                </div>

                                {/* OTP Display */}
                                <div style={{
                                    backgroundColor: '#fef3c7',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    border: '2px solid #f59e0b',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>🔐 Your Ride OTP</h3>
                                    <div style={{
                                        fontSize: '36px',
                                        fontWeight: '800',
                                        color: '#92400e',
                                        letterSpacing: '8px',
                                        marginBottom: '10px',
                                        fontFamily: 'monospace'
                                    }}>
                                        {rideDetails.otp?.code}
                                    </div>
                                    <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                                        Share this OTP with your driver to start the ride
                                    </p>
                                </div>

                                {/* Trip Details */}
                                <div style={{
                                    backgroundColor: '#f0f9ff',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>🗺️ Trip Details</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: '#10b981',
                                                borderRadius: '50%'
                                            }}></div>
                                            <span style={{ color: '#374151', fontSize: '14px' }}>
                                                <strong>From:</strong> {rideDetails.pickup_location?.address}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: '#ef4444',
                                                borderRadius: '50%'
                                            }}></div>
                                            <span style={{ color: '#374151', fontSize: '14px' }}>
                                                <strong>To:</strong> {rideDetails.drop_location?.address}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Distance</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600' }}>
                                                {rideDetails.distance?.toFixed(1)} km
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Fare</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a' }}>
                                                ₹{rideDetails.fare}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Payment</div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb' }}>
                                                {rideDetails.payment_method === 'cash' ? '💵 Cash' : '💳 Online'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Change */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    marginBottom: '20px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', color: '#64748b' }}>Payment Method</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
                                                {rideDetails.payment_method === 'cash' ? '💵 Cash' : '💳 Online Payment'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setBookingStep('change_payment')}
                                            className="btn btn-primary"
                                            style={{
                                                padding: '8px 16px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setBookingStep('tracking')}
                                        className="btn btn-success"
                                        style={{
                                            padding: '12px 24px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        🗺️ Track Ride
                                    </button>
                                    <button
                                        onClick={resetBooking}
                                        className="btn btn-danger"
                                        style={{
                                            padding: '12px 24px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        Cancel Ride
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {bookingStep === 'change_payment' && rideDetails && (
                        <motion.div 
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            style={{ marginTop: '30px' }}
                        >
                            <div style={{
                                backgroundColor: 'white',
                                padding: '30px',
                                borderRadius: '15px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3748' }}>Change Payment Method</h3>
                                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Ride Summary</h4>
                                    <p style={{ margin: '5px 0', color: '#64748b' }}>Vehicle: {selectedVehicle?.name}</p>
                                    <p style={{ margin: '5px 0', color: '#64748b' }}>From: {pickupLocation?.address?.substring(0, 50)}...</p>
                                    <p style={{ margin: '5px 0', color: '#64748b' }}>To: {destinationLocation?.address?.substring(0, 50)}...</p>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>Total: ₹{rideDetails.fare}</p>
                                </div>
                                <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                                    {[
                                        { name: 'Cash', value: 'cash', icon: '💵', desc: 'Pay Driver Directly' },
                                        { name: 'Razorpay', value: 'razorpay', icon: '💳', desc: 'UPI/Card/Wallet' },
                                        { name: 'Stripe', value: 'stripe', icon: '💳', desc: 'International Cards' },
                                        { name: 'PayPal', value: 'paypal', icon: '🅿️', desc: 'PayPal Account' }
                                    ].map(method => (
                                        <button 
                                            key={method.value} 
                                            onClick={() => {
                                                setRideDetails(prev => ({ ...prev, payment_method: method.value }));
                                                setBookingStep('confirmed');
                                            }}
                                            style={{
                                                padding: '15px', 
                                                backgroundColor: rideDetails.payment_method === method.value ? '#f0f9ff' : 'white', 
                                                border: `2px solid ${rideDetails.payment_method === method.value ? '#0ea5e9' : '#e2e8f0'}`, 
                                                borderRadius: '10px', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (rideDetails.payment_method !== method.value) {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.backgroundColor = '#f8fafc';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (rideDetails.payment_method !== method.value) {
                                                    e.target.style.borderColor = '#e2e8f0';
                                                    e.target.style.backgroundColor = 'white';
                                                }
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '20px' }}>{method.icon}</span>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontWeight: '600', color: '#2d3748' }}>{method.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{method.desc}</div>
                                                </div>
                                            </div>
                                            {rideDetails.payment_method === method.value && (
                                                <div style={{ color: '#0ea5e9', fontSize: '18px' }}>✓</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <button 
                                        onClick={() => setBookingStep('confirmed')} 
                                        className="btn btn-secondary"
                                        style={{
                                            padding: '10px 20px'
                                        }}
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {bookingStep === 'searching' && (
                        <motion.div 
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            style={{ marginTop: '30px', textAlign: 'center' }}
                        >
                            <div style={{
                                backgroundColor: '#f0f9ff',
                                padding: '40px',
                                borderRadius: '20px',
                                border: '2px solid #0ea5e9',
                                marginBottom: '30px'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                                <h3 style={{ color: '#0c4a6e', marginBottom: '15px', fontSize: '1.5rem' }}>Searching for Driver...</h3>
                                <p style={{ color: '#0369a1', marginBottom: '20px' }}>
                                    Looking for nearby drivers... This may take up to 2 minutes.
                                </p>
                                
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '20px'
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                scale: [1, 1.3, 1],
                                                opacity: [0.4, 1, 0.4]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.3
                                            }}
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: '#0ea5e9'
                                            }}
                                        />
                                    ))}
                                </div>
                                
                                <div style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    textAlign: 'center',
                                    marginBottom: '20px'
                                }}>
                                    🔍 Searching for available drivers nearby...
                                </div>
                                
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '20px'
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: '#0ea5e9'
                                            }}
                                        />
                                    ))}
                                </div>
                                
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '15px',
                                    textAlign: 'left',
                                    marginBottom: '25px'
                                }}>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Finding you a {selectedVehicle?.name || 'ride'}...</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: '#10b981',
                                            borderRadius: '50%'
                                        }}></div>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>
                                            {pickupLocation?.address?.substring(0, 40)}...
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: '#ef4444',
                                            borderRadius: '50%'
                                        }}></div>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>
                                            {destinationLocation?.address?.substring(0, 40)}...
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '12px' }}>Distance: </span>
                                            <span style={{ color: '#2d3748', fontSize: '14px', fontWeight: '600' }}>{selectedVehicle?.distance?.toFixed(1)} km</span>
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '12px' }}>Fare: </span>
                                            <span style={{ color: '#22c55e', fontSize: '16px', fontWeight: '700' }}>₹{selectedVehicle?.estimatedFare}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={resetBooking}
                                    className="btn btn-danger"
                                    style={{
                                        padding: '12px 30px',
                                        fontSize: '16px'
                                    }}
                                >
                                    Cancel Search
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {bookingStep === 'error' && (
                        <motion.div 
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            style={{ marginTop: '30px', textAlign: 'center' }}
                        >
                            <div style={{
                                backgroundColor: '#fef2f2',
                                padding: '40px',
                                borderRadius: '20px',
                                border: '2px solid #ef4444',
                                marginBottom: '30px'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏰</div>
                                <h3 style={{ color: '#dc2626', marginBottom: '15px', fontSize: '1.5rem' }}>No Driver Available</h3>
                                <p style={{ color: '#b91c1c', marginBottom: '20px' }}>
                                    No drivers accepted your request within 5 minutes. This could be due to high demand or no drivers in your area.
                                </p>
                                
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => handleRideRequest(selectedVehicle, rideDetails?.payment_method || 'cash')}
                                        className="btn btn-success"
                                        style={{
                                            padding: '12px 30px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        🔄 Try Again
                                    </button>
                                    <button
                                        onClick={resetBooking}
                                        className="btn btn-secondary"
                                        style={{
                                            padding: '12px 30px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        ← Start Over
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {bookingStep === 'tracking' && rideDetails && (
                        <motion.div 
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            style={{ marginTop: '30px' }}
                        >
                            <div style={{
                                backgroundColor: 'white',
                                padding: '30px',
                                borderRadius: '15px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                marginBottom: '20px'
                            }}>
                                {/* Live Tracking Header */}
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '25px',
                                    paddingBottom: '15px',
                                    borderBottom: '2px solid #f1f5f9'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚗</div>
                                    <h2 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>Driver is on the way</h2>
                                    <p style={{ margin: 0, color: '#64748b' }}>ETA: {rideDetails.driver_info?.eta} minutes</p>
                                </div>

                                {/* Driver Card */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundColor: '#e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>👨💼</div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>{rideDetails.driver_info?.name}</h4>
                                        <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}>
                                            ⭐ {rideDetails.driver_info?.rating} • {rideDetails.driver_info?.vehicle_number}
                                        </p>
                                        <p style={{ margin: 0, color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>
                                            📍 {rideDetails.driver_info?.distance_from_user} km away
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <a href={`tel:${rideDetails.driver_info?.phone}`} style={{
                                            display: 'inline-block',
                                            padding: '8px 12px',
                                            backgroundColor: '#22c55e',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            textAlign: 'center'
                                        }}>📞 Call</a>
                                        <button className="btn btn-primary" style={{
                                            padding: '8px 12px',
                                            fontSize: '12px'
                                        }}>💬 Message</button>
                                    </div>
                                </div>


                                {/* Trip Progress */}
                                <div style={{
                                    backgroundColor: '#f0f9ff',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>🗺️ Trip Progress</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: '#10b981',
                                                borderRadius: '50%'
                                            }}></div>
                                            <span style={{ color: '#374151', fontSize: '14px' }}>
                                                <strong>Pickup:</strong> {rideDetails.pickup_location?.address}
                                            </span>
                                        </div>
                                        <div style={{ marginLeft: '6px', width: '2px', height: '20px', backgroundColor: '#d1d5db' }}></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: '#ef4444',
                                                borderRadius: '50%'
                                            }}></div>
                                            <span style={{ color: '#374151', fontSize: '14px' }}>
                                                <strong>Destination:</strong> {rideDetails.drop_location?.address}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* OTP Reminder */}
                                <div style={{
                                    backgroundColor: '#fef3c7',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px', fontWeight: '600' }}>
                                        Your OTP: <span style={{ fontSize: '18px', letterSpacing: '2px' }}>{rideDetails.otp?.code}</span>
                                    </p>
                                    <p style={{ margin: 0, color: '#92400e', fontSize: '12px' }}>
                                        Share this with your driver when they arrive
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setBookingStep('confirmed')}
                                        className="btn btn-secondary"
                                        style={{
                                            padding: '12px 24px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        ← Back to Details
                                    </button>
                                    <button
                                        onClick={resetBooking}
                                        className="btn btn-danger"
                                        style={{
                                            padding: '12px 24px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        Cancel Ride
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}


                </AnimatedCard>
                )}
                
                {/* Ride History Section */}
                {activeTab === 'history' && (
                <AnimatedCard style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
                    <h2 style={{ marginBottom: '30px', color: '#2d3748' }}>Your Ride History</h2>
                    
                    {rideHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚗</div>
                            <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>No rides yet</h3>
                            <p>Book your first ride to see your history here!</p>
                            <button 
                                onClick={() => setActiveTab('book')}
                                className="btn btn-primary"
                                style={{ marginTop: '20px' }}
                            >
                                🚀 Book Your First Ride
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {rideHistory.map((ride) => (
                                <div 
                                    key={ride._id} 
                                    className="ride-history-card"
                                    style={{
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '15px',
                                        padding: '20px',
                                        transition: 'all 0.3s ease',
                                        cursor: ride.status === 'requested' ? 'pointer' : 'default'
                                    }}
                                    onClick={() => {
                                        if (ride.status === 'requested') {
                                            setActiveTab('book');
                                            setBookingStep('searching');
                                            setRideDetails(ride);
                                            setSelectedVehicle({ type: ride.vehicle_type, estimatedFare: ride.fare });
                                            setPickupLocation({ address: ride.pickup_location?.address, latitude: ride.pickup_location?.latitude, longitude: ride.pickup_location?.longitude });
                                            setDestinationLocation({ address: ride.drop_location?.address, latitude: ride.drop_location?.latitude, longitude: ride.drop_location?.longitude });
                                            setSearchingDriver(true);
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        if (ride.status === 'requested') {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (ride.status === 'requested') {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: 
                                                    ride.status === 'completed' ? '#22c55e' :
                                                    ride.status === 'cancelled' ? '#ef4444' :
                                                    ride.status === 'in_progress' ? '#f59e0b' : '#667eea',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '18px'
                                            }}>
                                                {ride.status === 'completed' ? '✅' :
                                                 ride.status === 'cancelled' ? '❌' :
                                                 ride.status === 'in_progress' ? '🚗' : '⏳'}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', color: '#2d3748' }}>
                                                    Trip #{ride._id.slice(-6).toUpperCase()}
                                                </h4>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                                    {new Date(ride.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor:
                                                    ride.status === 'completed' ? '#dcfce7' :
                                                    ride.status === 'cancelled' ? '#fef2f2' :
                                                    ride.status === 'in_progress' ? '#fef3c7' : '#dbeafe',
                                                color:
                                                    ride.status === 'completed' ? '#16a34a' :
                                                    ride.status === 'cancelled' ? '#dc2626' :
                                                    ride.status === 'in_progress' ? '#d97706' : '#2563eb'
                                            }}>
                                                {ride.status.replace('_', ' ').toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e', marginTop: '8px' }}>
                                                ₹{ride.fare || 0}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ color: '#22c55e', fontSize: '16px' }}>📍</span>
                                            <span style={{ color: '#2d3748', fontSize: '14px', fontWeight: '500' }}>
                                                From: {ride.pickup_location?.address || 'Unknown location'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ color: '#ef4444', fontSize: '16px' }}>🎯</span>
                                            <span style={{ color: '#2d3748', fontSize: '14px', fontWeight: '500' }}>
                                                To: {ride.drop_location?.address || 'Unknown location'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                <span style={{ fontWeight: '600' }}>Distance:</span> {ride.distance?.toFixed(1) || 0} km
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                <span style={{ fontWeight: '600' }}>Vehicle:</span> {ride.vehicle_type || 'N/A'}
                                            </div>
                                            {ride.driver_id && (
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    <span style={{ fontWeight: '600' }}>Driver:</span> {ride.driver_id.name}
                                                </div>
                                            )}
                                            {ride.status === 'requested' && (
                                                <div style={{ fontSize: '12px', color: '#f59e0b' }}>
                                                    <span style={{ fontWeight: '600' }}>Status:</span> Waiting for driver
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {(ride.status === 'accepted' || ride.status === 'in_progress') && (
                                                <Link 
                                                    to={`/track-ride/${ride._id}`}
                                                    className="btn btn-primary"
                                                    style={{ padding: '6px 16px', fontSize: '12px', textDecoration: 'none' }}
                                                >
                                                    📍 Track Ride
                                                </Link>
                                            )}
                                            {ride.status === 'requested' && (
                                                <button 
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to cancel this ride?')) {
                                                            try {
                                                                await api.put(`/rides/${ride._id}/cancel`);
                                                                fetchRideHistory();
                                                            } catch (error) {
                                                                alert('Failed to cancel ride');
                                                            }
                                                        }
                                                    }}
                                                    className="btn btn-danger"
                                                    style={{ padding: '6px 16px', fontSize: '12px' }}
                                                >
                                                    ❌ Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AnimatedCard>
                )}
                
                {/* Live Chat Support */}
                <motion.div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                    {!showChat && (
                        <button
                            onClick={() => setShowChat(true)}
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            💬
                        </button>
                    )}
                    
                    {showChat && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowChat(false)}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    zIndex: 1001
                                }}
                            >
                                ×
                            </button>
                            {user ? (
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    width: '280px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>💬 Chat Support</h3>
                                    <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px' }}>
                                        Chat feature is currently unavailable. Please contact support directly.
                                    </p>
                                    <a href="/contact" className="btn btn-primary" style={{
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        textDecoration: 'none'
                                    }}>Contact Support</a>
                                </div>
                            ) : (
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '15px',
                                    padding: '20px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    width: '300px'
                                }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>🤖 AI Chat Support</h3>
                                    <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px' }}>
                                        Please log in to access our AI chat support for car rental assistance.
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <a href="/login" className="btn btn-primary" style={{
                                            padding: '8px 16px',
                                            fontSize: '12px',
                                            textDecoration: 'none'
                                        }}>Login</a>
                                        <a href="/signup" className="btn btn-success" style={{
                                            padding: '8px 16px',
                                            fontSize: '12px',
                                            textDecoration: 'none'
                                        }}>Sign Up</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatedContainer>

        </div>
    );
}