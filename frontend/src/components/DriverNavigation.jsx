import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import api from '../services/api';

export default function DriverNavigation({ ride, onRideStart, onRideEnd }) {
    const [rideDetails, setRideDetails] = useState(null);
    const [otpInput, setOtpInput] = useState('');
    const [paymentReceived, setPaymentReceived] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [navigationStarted, setNavigationStarted] = useState(false);

    useEffect(() => {
        if (ride) {
            loadRideDetails();
            getCurrentLocation();
        }
    }, [ride]);

    const loadRideDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/rides/${ride._id}`);
            if (response.data.success) {
                setRideDetails(response.data.ride);
            }
        } catch (error) {
            console.error('Error loading ride details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        }
    };

    const handleStartRide = async () => {
        if (!otpInput || otpInput.length !== 4) {
            alert('Please enter a valid 4-digit OTP');
            return;
        }

        try {
            const response = await api.post(`/rides/${ride._id}/verify-otp`, {
                otp: otpInput
            });

            if (response.data.success) {
                setNavigationStarted(true);
                onRideStart && onRideStart();
                alert('Ride started successfully!');
            } else {
                alert(response.data.error || 'Invalid OTP');
            }
        } catch (error) {
            console.error('Error starting ride:', error);
            alert(error.response?.data?.error || 'Failed to start ride');
        }
    };

    const handleEndRide = async () => {
        if (!paymentReceived) {
            alert('Please confirm that you have received payment before ending the ride');
            return;
        }

        try {
            const response = await api.put(`/rides/${ride._id}/complete-with-payment`, {
                paymentReceived: true
            });

            if (response.data.success) {
                onRideEnd && onRideEnd();
                alert('Ride completed successfully!');
            } else {
                alert(response.data.error || 'Failed to complete ride');
            }
        } catch (error) {
            console.error('Error ending ride:', error);
            alert(error.response?.data?.error || 'Failed to complete ride');
        }
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    if (loading) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                <p>Loading navigation...</p>
            </div>
        );
    }

    if (!rideDetails) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
                <p>Unable to load ride details</p>
            </div>
        );
    }

    const distanceToPickup = currentLocation ? 
        calculateDistance(
            currentLocation.lat, currentLocation.lng,
            rideDetails.pickup_location.latitude, rideDetails.pickup_location.longitude
        ) : 0;

    const distanceToDestination = currentLocation ?
        calculateDistance(
            currentLocation.lat, currentLocation.lng,
            rideDetails.drop_location.latitude, rideDetails.drop_location.longitude
        ) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f1f5f9'
            }}>
                <h2 style={{ margin: 0, color: '#1e293b' }}>🧭 Navigation & Ride Control</h2>
                <div style={{
                    padding: '8px 16px',
                    backgroundColor: rideDetails.status === 'accepted' ? '#dcfce7' : '#fef3c7',
                    color: rideDetails.status === 'accepted' ? '#16a34a' : '#d97706',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                }}>
                    {rideDetails.status === 'accepted' ? 'Ready to Start' : 'In Progress'}
                </div>
            </div>

            {/* Passenger Information */}
            <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>👤 Passenger Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Passenger Name</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            {rideDetails?.user_id?.name || 'Loading...'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Phone</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            {rideDetails?.user_id?.phone || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Payment Method</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            {rideDetails?.payment_method?.toUpperCase() || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Fare</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a' }}>
                            ₹{rideDetails?.fare || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Map Placeholder */}
            <div style={{
                backgroundColor: '#f0f9ff',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>🗺️ Navigation Map</h3>
                <div style={{
                    height: '200px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #0891b2',
                    marginBottom: '15px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</div>
                        <p style={{ margin: 0, color: '#0369a1' }}>
                            {navigationStarted ? 'Navigation Active' : 'Map will appear when ride starts'}
                        </p>
                    </div>
                </div>
                
                {/* Route Information */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '5px' }}>Distance to Pickup</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1' }}>
                            {distanceToPickup.toFixed(1)} km
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '5px' }}>Distance to Destination</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1' }}>
                            {distanceToDestination.toFixed(1)} km
                        </div>
                    </div>
                </div>
            </div>

            {/* Route Details */}
            <div style={{
                backgroundColor: '#f0f9ff',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>📍 Route Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%'
                        }}></div>
                        <span style={{ color: '#374151' }}>
                            <strong>Pickup:</strong> {rideDetails?.pickup_location?.address || 'Pickup location'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%'
                        }}></div>
                        <span style={{ color: '#374151' }}>
                            <strong>Destination:</strong> {rideDetails?.drop_location?.address || 'Destination'}
                        </span>
                    </div>
                </div>
            </div>

            {/* OTP Verification */}
            {rideDetails.status === 'accepted' && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '2px solid #f59e0b',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>🔐 Start Ride with OTP</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#92400e', fontSize: '14px' }}>
                        Ask the passenger for their 4-digit OTP to start the ride
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="Enter 4-digit OTP"
                            maxLength="4"
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: '2px solid #f59e0b',
                                borderRadius: '8px',
                                fontSize: '18px',
                                textAlign: 'center',
                                letterSpacing: '4px',
                                fontWeight: '600'
                            }}
                        />
                        <button
                            onClick={handleStartRide}
                            disabled={otpInput.length !== 4}
                            style={{
                                padding: '15px 25px',
                                backgroundColor: otpInput.length === 4 ? '#10b981' : '#9ca3af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: otpInput.length === 4 ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Start Ride
                        </button>
                    </div>
                </div>
            )}

            {/* End Ride Section */}
            {rideDetails.status === 'in_progress' && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '2px solid #f87171',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#dc2626' }}>🏁 End Ride</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#dc2626', fontSize: '14px' }}>
                        Confirm that you have received payment before ending the ride
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                        <input
                            type="checkbox"
                            id="paymentReceived"
                            checked={paymentReceived}
                            onChange={(e) => setPaymentReceived(e.target.checked)}
                            style={{ transform: 'scale(1.2)' }}
                        />
                        <label htmlFor="paymentReceived" style={{ color: '#dc2626', fontWeight: '600' }}>
                            I have received payment of ₹{rideDetails?.fare || 0}
                        </label>
                    </div>
                    <button
                        onClick={handleEndRide}
                        disabled={!paymentReceived}
                        style={{
                            padding: '15px 25px',
                            backgroundColor: paymentReceived ? '#dc2626' : '#9ca3af',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: paymentReceived ? 'pointer' : 'not-allowed'
                        }}
                    >
                        End Ride
                    </button>
                </div>
            )}

            {/* Current Location */}
            {currentLocation && (
                <div style={{
                    backgroundColor: '#f0fdf4',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#16a34a'
                }}>
                    📍 Your current location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </div>
            )}
        </motion.div>
    );
}

DriverNavigation.propTypes = {
    ride: PropTypes.object.isRequired,
    onRideStart: PropTypes.func,
    onRideEnd: PropTypes.func
};
