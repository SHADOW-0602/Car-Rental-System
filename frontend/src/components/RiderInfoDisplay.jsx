import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import api from '../services/api';

export default function RiderInfoDisplay({ ride, onRideStart, onRideComplete }) {
    const [rideDetails, setRideDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (ride) {
            loadRideDetails();
        }
    }, [ride]);

    useEffect(() => {
        let interval;
        if (rideDetails?.otp?.expires_at) {
            const updateCountdown = () => {
                const now = new Date().getTime();
                const expiry = new Date(rideDetails.otp.expires_at).getTime();
                const timeLeft = Math.max(0, Math.floor((expiry - now) / 1000));
                setCountdown(timeLeft);
                
                if (timeLeft === 0) {
                    clearInterval(interval);
                }
            };
            
            updateCountdown();
            interval = setInterval(updateCountdown, 1000);
        }
        
        return () => clearInterval(interval);
    }, [rideDetails]);

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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <p>Loading ride details...</p>
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
                <h2 style={{ margin: 0, color: '#1e293b' }}>🚗 Your Ride Details</h2>
                <div style={{
                    padding: '8px 16px',
                    backgroundColor: rideDetails.status === 'accepted' ? '#dcfce7' : '#fef3c7',
                    color: rideDetails.status === 'accepted' ? '#16a34a' : '#d97706',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                }}>
                    {rideDetails.status === 'accepted' ? 'Driver Assigned' : 'In Progress'}
                </div>
            </div>

            {/* Driver Information */}
            <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>👨‍💼 Driver Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Driver Name</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            {rideDetails?.driver_info?.name || 'Loading...'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Phone</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            {rideDetails?.driver_info?.phone || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Vehicle Number</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            {rideDetails?.driver_info?.vehicle_number || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Rating</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                            ⭐ {rideDetails?.driver_info?.rating || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Distance and ETA */}
            <div style={{
                backgroundColor: '#fef3c7',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>📍 Location & Timing</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '5px' }}>Distance from you</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400e' }}>
                            {rideDetails?.driver_info?.distance_from_user || 0} km
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '5px' }}>Estimated arrival</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400e' }}>
                            {rideDetails?.driver_info?.eta || 0} min
                        </div>
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
                    {rideDetails.otp?.code || '----'}
                </div>
                <p style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '14px' }}>
                    Share this OTP with your driver to start the ride
                </p>
                {countdown > 0 && (
                    <div style={{
                        fontSize: '12px',
                        color: '#d97706',
                        fontWeight: '600'
                    }}>
                        Expires in: {formatTime(countdown)}
                    </div>
                )}
                {countdown === 0 && rideDetails.otp && (
                    <div style={{
                        fontSize: '12px',
                        color: '#dc2626',
                        fontWeight: '600'
                    }}>
                        OTP has expired. Please request a new ride.
                    </div>
                )}
            </div>

            {/* Ride Route */}
            <div style={{
                backgroundColor: '#f0f9ff',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>🗺️ Route Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%'
                        }}></div>
                        <span style={{ color: '#374151' }}>
                            <strong>From:</strong> {rideDetails.pickup_location?.address || 'Pickup location'}
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
                            <strong>To:</strong> {rideDetails.drop_location?.address || 'Destination'}
                        </span>
                    </div>
                </div>
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Distance</div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>
                            {rideDetails.distance || 0} km
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Fare</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a' }}>
                            ₹{rideDetails.fare || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {rideDetails.status === 'accepted' && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={() => onRideStart && onRideStart()}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        🚀 Track Ride
                    </button>
                </div>
            )}
        </motion.div>
    );
}

RiderInfoDisplay.propTypes = {
    ride: PropTypes.object.isRequired,
    onRideStart: PropTypes.func,
    onRideComplete: PropTypes.func
};
