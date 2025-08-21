import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MapPicker from '../components/MapPicker';
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

    const handleBookRide = () => {
        if (!user) {
            const email = prompt('Enter your email to continue:');
            if (email) {
                if (email.includes('@')) {
                    window.location.href = '/login';
                } else {
                    window.location.href = '/signup';
                }
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

    const handlePaymentSuccess = () => {
        const pin = Math.floor(1000 + Math.random() * 9000);
        setRidePin(pin);
        
        const details = {
            id: 'RIDE' + Date.now(),
            pickup: pickupLocation.address,
            destination: destinationLocation.address,
            vehicle: selectedVehicle,
            fare: selectedVehicle.estimatedFare,
            pin: pin,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        setRideDetails(details);
        setBookingStep('confirmation');
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
                        🚗 RideEasy - Premium Car Rental
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
                                See how easy it is to book a ride with RideEasy
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

                {/* Features Showcase */}
                <ScrollFadeIn style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                            Why Choose RideEasy?
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            We're revolutionizing transportation with cutting-edge technology and premium service
                        </p>
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
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e2e8f0' }}
                        >
                            <div style={{ fontSize: '80px', marginBottom: '20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Lightning Fast Booking</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>Book your ride in under 30 seconds with our streamlined booking process. Real-time driver matching and instant confirmations.</p>
                        </motion.div>
                        
                        <motion.div 
                            variants={staggerItem}
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e2e8f0' }}
                        >
                            <div style={{ fontSize: '80px', marginBottom: '20px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛡️</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>100% Safe & Secure</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>All drivers are thoroughly vetted and background-checked. GPS tracking, emergency support, and secure payment processing.</p>
                        </motion.div>
                        
                        <motion.div 
                            variants={staggerItem}
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e2e8f0' }}
                        >
                            <div style={{ fontSize: '80px', marginBottom: '20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💰</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Transparent Pricing</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>No hidden fees, no surge pricing surprises. Upfront pricing with multiple payment options and loyalty rewards.</p>
                        </motion.div>
                    </motion.div>

                    {/* Vehicle Fleet */}
                    <ScrollSlideLeft style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                            🚘 Our Premium Fleet
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Choose from our diverse range of vehicles for every occasion</p>
                    </ScrollSlideLeft>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '80px' }}
                    >
                        <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
                            <div style={{ height: '200px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '80px', color: 'white' }}>🚗</div>
                            </div>
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>Economy Cars</h3>
                                <p style={{ color: '#64748b', marginBottom: '15px' }}>Perfect for daily commutes and city travel. Fuel-efficient and budget-friendly.</p>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#22c55e' }}>₹20 base + ₹8/km</div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
                            <div style={{ height: '200px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '80px', color: 'white' }}>🚙</div>
                            </div>
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>Premium SUVs</h3>
                                <p style={{ color: '#64748b', marginBottom: '15px' }}>Spacious and comfortable for families and groups. Premium amenities included.</p>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#22c55e' }}>₹20 base + ₹18/km</div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
                            <div style={{ height: '200px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '80px', color: 'white' }}>🚘</div>
                            </div>
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>Luxury Vehicles</h3>
                                <p style={{ color: '#64748b', marginBottom: '15px' }}>Executive travel with style. Premium interiors and professional chauffeurs.</p>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#22c55e' }}>₹20 base + ₹25/km</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Call to Action */}
                    <ScrollScale style={{
                        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                        borderRadius: '30px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        border: '2px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎆</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                            Ready to Experience Premium Transportation?
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                            Join thousands of satisfied customers who trust RideEasy for their daily transportation needs.
                        </p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="/signup" style={{
                                padding: '18px 40px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '50px',
                                fontSize: '18px',
                                fontWeight: '600',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease'
                            }}>
                                🚀 Sign Up Free
                            </a>
                            <a href="/driver/register" style={{
                                padding: '18px 40px',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '50px',
                                fontSize: '18px',
                                fontWeight: '600',
                                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                                transition: 'all 0.3s ease'
                            }}>
                                🚕 Become a Driver
                            </a>
                        </div>
                    </ScrollScale>
                </ScrollFadeIn>
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
                    Welcome back! 🚗
                </h1>
                
                {/* Booking Form for Authenticated Users */}
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
                                                <div style={{ fontSize: '32px' }}>{vehicle.icon}</div>
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
                            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3748' }}>Payment</h3>
                            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Ride Summary</h4>
                                <p style={{ margin: '5px 0', color: '#64748b' }}>Vehicle: {selectedVehicle.name} {selectedVehicle.icon}</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}>From: {pickupLocation.address.substring(0, 50)}...</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}>To: {destinationLocation.address.substring(0, 50)}...</p>
                                <p style={{ margin: '10px 0 0 0', fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>Total: ₹{selectedVehicle.estimatedFare}</p>
                            </div>
                            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                                {['Credit/Debit Card', 'UPI', 'Wallet', 'Cash'].map(method => (
                                    <button key={method} onClick={handlePaymentSuccess} style={{
                                        padding: '15px', backgroundColor: 'white', border: '2px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer'
                                    }}>
                                        {method === 'Credit/Debit Card' ? '💳' : method === 'UPI' ? '📱' : method === 'Wallet' ? '💼' : '💵'} {method}
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

                    {bookingStep === 'confirmation' && rideDetails && (
                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                            <h3 style={{ color: '#22c55e', marginBottom: '20px' }}>Ride Confirmed!</h3>
                            <div style={{ backgroundColor: '#f0f9ff', padding: '25px', borderRadius: '15px', marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Your Ride PIN</h4>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea', marginBottom: '10px' }}>{ridePin}</div>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Share this PIN with your driver</p>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '20px', textAlign: 'left' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Ride Details</h4>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Ride ID:</strong> {rideDetails.id}</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Vehicle:</strong> {rideDetails.vehicle.name}</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Fare:</strong> ₹{rideDetails.fare}</p>
                                <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Status:</strong> Waiting for driver</p>
                            </div>
                            <button onClick={resetBooking} style={{
                                padding: '15px 30px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '25px'
                            }}>Book Another Ride</button>
                        </div>
                    )}
                </AnimatedCard>
            </AnimatedContainer>
        </div>
    );
}