import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MapPicker from '../components/MapPicker';
import RideTracker from '../components/RideTracker';
import api from '../services/api';


import { haversineDistance } from '../utils/distance';
import { fadeIn, slideUp, staggerContainer, staggerItem, scaleIn } from '../animations/variants';
import { AnimatedButton, AnimatedCard, AnimatedContainer } from '../animations/AnimatedComponents';
import { ScrollFadeIn, ScrollSlideLeft, ScrollSlideRight, ScrollScale } from '../animations/ScrollAnimatedComponents';


export default function UserPortal({ user: propUser }) {
    const { user: contextUser } = useAuthContext();
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
    const [distance, setDistance] = useState(0);
    const [showChat, setShowChat] = useState(false);

    // Fetch ride history
    useEffect(() => {
        if (user) {
            fetchRideHistory();
        }
    }, [user]);

    const fetchRideHistory = async () => {
        try {
            const response = await api.get('/rides/user');
            if (response.data.success) {
                setRideHistory(response.data.rides);
            }
        } catch (error) {
            console.error('Failed to fetch ride history:', error);
        }
    };

    const handleBookRide = () => {
        if (!user) {
            if (pickupLocation && destinationLocation) {
                window.location.href = '/signup';
            } else {
                window.location.href = '/signup';
            }
        } else {
            if (pickupLocation && destinationLocation) {
                setBookingStep('vehicles');
            } else {
                alert('Please select both pickup and destination locations');
            }
        }
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setBookingStep('payment');
    };

    const handlePaymentSuccess = async (paymentMethod) => {
        try {
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
                vehicle_type: selectedVehicle.type,
                payment_method: paymentMethod
            };
            
            const response = await api.post('/rides/request', rideData);
            
            if (response.data.success) {
                // Redirect to track ride page
                window.location.href = `/track-ride/${response.data.ride._id}`;
            }
        } catch (error) {
            console.error('Failed to create ride:', error);
            alert(error.response?.data?.error || 'Failed to create ride. Please try again.');
        }
    };

    const resetBooking = () => {
        setBookingStep('locations');
        setSelectedVehicle(null);
        setRidePin(null);
        setRideDetails(null);
        setPickupLocation(null);
        setDestinationLocation(null);
        setSearchData({ pickup: '', destination: '' });
        setDistance(0);
    };

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <Navbar user={user} />
                
                {/* Hero Section */}
                <AnimatedContainer
                    variants={fadeIn}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '100px 20px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        fontSize: '120px',
                        opacity: '0.1'
                    }}>🚗</div>
                    <motion.h1 
                        variants={slideUp}
                        style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '30px', textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
                    >
                        🚗 UrbanFleet - Premium Car Rental
                    </motion.h1>
                    <p style={{ fontSize: '1.4rem', opacity: '0.9', marginBottom: '50px', maxWidth: '600px', margin: '0 auto 50px' }}>
                        Experience luxury transportation with our premium fleet of vehicles. Safe, reliable, and affordable rides at your fingertips.
                    </p>
                    
                    <motion.div 
                        variants={staggerContainer}
                        style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <motion.a 
                            variants={staggerItem}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/login" 
                            style={{
                                padding: '18px 40px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '50px',
                                fontSize: '18px',
                                fontWeight: '600',
                                border: '2px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🚀 Start Your Journey
                        </motion.a>
                        <motion.a 
                            variants={staggerItem}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/signup" 
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
                            🎆 Join Now - Free
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
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '10px' }}>
                                🚀 Try Our Booking Experience
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                                See how easy it is to book a ride with UrbanFleet
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
                            <AnimatedButton
                                onClick={handleBookRide}
                                style={{
                                    padding: '18px 40px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {pickupLocation && destinationLocation ? '🚀 Sign Up to See Pricing & Book' : '🚀 Try Booking Experience'}
                            </AnimatedButton>
                            {pickupLocation && destinationLocation && (
                                <p style={{ marginTop: '15px', color: '#64748b', fontSize: '14px' }}>
                                    💡 Distance: {haversineDistance(pickupLocation.latitude, pickupLocation.longitude, destinationLocation.latitude, destinationLocation.longitude).toFixed(1)} km - Sign up to see pricing
                                </p>
                            )}
                        </div>
                    </div>
                </AnimatedContainer>

                {/* Enhanced Features Showcase */}
                <ScrollFadeIn style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <motion.h2 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{ fontSize: '3rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}
                        >
                            Why Choose UrbanFleet?
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}
                        >
                            We're revolutionizing transportation with cutting-edge technology and premium service
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
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Lightning Fast Booking</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>Book your ride in under 30 seconds with our streamlined booking process. Real-time driver matching and instant confirmations.</p>
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
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>100% Safe & Secure</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>All drivers are thoroughly vetted and background-checked. GPS tracking, emergency support, and secure payment processing.</p>
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
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Transparent Pricing</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>No hidden fees, no surge pricing surprises. Upfront pricing with multiple payment options and loyalty rewards.</p>
                        </motion.div>
                    </motion.div>

                    {/* Vehicle Fleet with Parallax Effect */}
                    <ScrollSlideLeft style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <motion.h2 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}
                        >
                            🚘 Our Premium Fleet
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ fontSize: '1.1rem', color: '#64748b' }}
                        >
                            Choose from our diverse range of vehicles for every occasion
                        </motion.p>
                    </ScrollSlideLeft>

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
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>Economy Cars</h3>
                                <p style={{ color: '#64748b', marginBottom: '15px' }}>Perfect for daily commutes and city travel. Fuel-efficient and budget-friendly.</p>
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
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>Premium SUVs</h3>
                                <p style={{ color: '#64748b', marginBottom: '15px' }}>Spacious and comfortable for families and groups. Premium amenities included.</p>
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
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>Luxury Vehicles</h3>
                                <p style={{ color: '#64748b', marginBottom: '15px' }}>Executive travel with style. Premium interiors and professional chauffeurs.</p>
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
                    <ScrollScale style={{
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
                    </ScrollScale>
                </ScrollFadeIn>
                
                {/* Enhanced Live Chat Support */}
                <motion.div 
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}
                >
                    {!showChat && (
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{ y: [0, -5, 0] }}
                            transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                            onClick={() => setShowChat(true)}
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease'
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
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '15px',
                                padding: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                width: '300px'
                            }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Need Help?</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px' }}>
                                    Please sign up or log in to access our AI chat support.
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <a href="/login" style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>Login</a>
                                    <a href="/signup" style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#22c55e',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>Sign Up</a>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
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
                        onClick={() => setActiveTab('book')}
                        className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
                    >
                        🚗 Book Ride
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
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
                            <AnimatedButton
                                onClick={handleBookRide}
                                disabled={!pickupLocation || !destinationLocation}
                                style={{
                                    padding: '15px 40px',
                                    backgroundColor: (!pickupLocation || !destinationLocation) ? '#94a3b8' : '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    cursor: (!pickupLocation || !destinationLocation) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                🚀 Choose Vehicle
                            </AnimatedButton>
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
                                <AnimatedButton onClick={() => setBookingStep('locations')} style={{
                                    padding: '10px 20px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '25px'
                                }}>Back</AnimatedButton>
                            </div>
                        </motion.div>
                    )}

                    {bookingStep === 'payment' && selectedVehicle && (
                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3748' }}>Choose Payment Method</h3>
                            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Ride Summary</h4>
                                <p style={{ margin: '5px 0', color: '#64748b' }}>Vehicle: {selectedVehicle.name} {selectedVehicle.icon}</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}>From: {pickupLocation.address.substring(0, 50)}...</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}>To: {destinationLocation.address.substring(0, 50)}...</p>
                                <p style={{ margin: '10px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>Total: ₹{selectedVehicle.estimatedFare}</p>
                            </div>
                            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                                {[
                                    { name: 'Razorpay', value: 'razorpay', icon: '💳', desc: 'UPI/Card/Wallet' },
                                    { name: 'Stripe', value: 'stripe', icon: '💳', desc: 'International Cards' },
                                    { name: 'PayPal', value: 'paypal', icon: '🅿️', desc: 'PayPal Account' },
                                    { name: 'Cash', value: 'cash', icon: '💵', desc: 'Pay Driver Directly' }
                                ].map(method => (
                                    <button 
                                        key={method.value} 
                                        onClick={() => handlePaymentSuccess(method.value)} 
                                        style={{
                                            padding: '15px', 
                                            backgroundColor: 'white', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '10px', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.backgroundColor = '#f8fafc';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.backgroundColor = 'white';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '20px' }}>{method.icon}</span>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: '600', color: '#2d3748' }}>{method.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{method.desc}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <button onClick={() => setBookingStep('vehicles')} style={{
                                    padding: '10px 20px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '25px'
                                }}>Back</button>
                            </div>
                        </div>
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
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
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
                                        </div>
                                        
                                        {(ride.status === 'accepted' || ride.status === 'in_progress') && (
                                            <button 
                                                onClick={() => window.location.href = `/track-ride/${ride._id}`}
                                                className="btn btn-primary"
                                                style={{ padding: '6px 16px', fontSize: '12px' }}
                                            >
                                                📍 Track Ride
                                            </button>
                                        )}
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
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease'
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
                                    borderRadius: '15px',
                                    padding: '20px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    width: '300px'
                                }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>💬 Chat Support</h3>
                                    <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px' }}>
                                        Chat feature is currently unavailable. Please contact support directly.
                                    </p>
                                    <a href="/contact" style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600'
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
                                        <a href="/login" style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>Login</a>
                                        <a href="/signup" style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#22c55e',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
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