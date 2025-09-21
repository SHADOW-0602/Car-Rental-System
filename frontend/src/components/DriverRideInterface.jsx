import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function DriverRideInterface({ ride, onStartRide, onEndRide }) {
    const [otpInput, setOtpInput] = useState('');
    const [rideStatus, setRideStatus] = useState(ride?.status || 'accepted');
    const [paymentReceived, setPaymentReceived] = useState(false);

    const handleStartRide = () => {
        if (otpInput === ride.otp) {
            setRideStatus('in_progress');
            onStartRide();
        } else {
            alert('Invalid OTP. Please check with the passenger.');
        }
    };

    const handleEndRide = () => {
        if (!paymentReceived) {
            alert('Please collect payment before ending the ride.');
            return;
        }
        setRideStatus('completed');
        onEndRide();
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Ride Status Header */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: rideStatus === 'accepted' ? '#f59e0b' : rideStatus === 'in_progress' ? '#22c55e' : '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: 'white'
                    }}>
                        {rideStatus === 'accepted' ? '🚗' : rideStatus === 'in_progress' ? '🛣️' : '✅'}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, color: '#2d3748' }}>
                            {rideStatus === 'accepted' ? 'Navigate to Passenger' : 
                             rideStatus === 'in_progress' ? 'Trip in Progress' : 'Trip Completed'}
                        </h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Trip #{ride._id?.slice(-6).toUpperCase() || 'DEMO123'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Map */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>📍 Navigation</h3>
                <div style={{
                    height: '300px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #cbd5e1',
                    marginBottom: '15px'
                }}>
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</div>
                        <p>Navigation Map Integration</p>
                        <p style={{ fontSize: '14px' }}>Google Maps / Apple Maps</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        🧭 Open in Google Maps
                    </button>
                    <button style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        🍎 Open in Apple Maps
                    </button>
                </div>
            </div>

            {/* Passenger Information */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>👤 Passenger Details</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                    }}>👤</div>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>Amit Sharma</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>⭐ 4.9 • +91 98765 12345</p>
                    </div>
                    <a href="tel:+919876512345" style={{
                        padding: '10px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        borderRadius: '50%',
                        textDecoration: 'none',
                        fontSize: '16px',
                        marginLeft: 'auto'
                    }}>📞</a>
                </div>
                
                <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>📍</span>
                        <span style={{ color: '#2d3748', fontSize: '14px' }}>
                            From: {ride.pickup_location?.address || 'Connaught Place, New Delhi'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#ef4444', fontSize: '16px' }}>🎯</span>
                        <span style={{ color: '#2d3748', fontSize: '14px' }}>
                            To: {ride.drop_location?.address || 'IGI Airport, New Delhi'}
                        </span>
                    </div>
                </div>
            </div>

            {/* OTP Verification */}
            {rideStatus === 'accepted' && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        backgroundColor: '#fef3c7',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '2px solid #f59e0b',
                        marginBottom: '20px'
                    }}
                >
                    <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>🔐 Start Ride with OTP</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#92400e', fontSize: '14px' }}>
                        Ask the passenger for their 4-digit OTP to start the ride
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
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
                                backgroundColor: otpInput.length === 4 ? '#22c55e' : '#94a3b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: otpInput.length === 4 ? 'pointer' : 'not-allowed'
                            }}
                        >
                            🚀 Start Ride
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Payment Collection */}
            {rideStatus === 'in_progress' && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        marginBottom: '20px'
                    }}
                >
                    <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>💰 Payment Collection</h3>
                    <div style={{
                        backgroundColor: '#f0f9ff',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #0ea5e9',
                        marginBottom: '15px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#0c4a6e', fontWeight: '600' }}>Trip Fare:</span>
                            <span style={{ color: '#0c4a6e', fontSize: '20px', fontWeight: '700' }}>
                                ₹{ride.fare || 250}
                            </span>
                        </div>
                        <p style={{ margin: '5px 0 0 0', color: '#0369a1', fontSize: '12px' }}>
                            Payment Method: {ride.payment_method || 'Cash'}
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <input
                            type="checkbox"
                            id="paymentReceived"
                            checked={paymentReceived}
                            onChange={(e) => setPaymentReceived(e.target.checked)}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <label htmlFor="paymentReceived" style={{ color: '#2d3748', fontWeight: '600' }}>
                            ✅ Payment received from passenger
                        </label>
                    </div>
                    
                    <button
                        onClick={handleEndRide}
                        disabled={!paymentReceived}
                        style={{
                            width: '100%',
                            padding: '15px',
                            backgroundColor: paymentReceived ? '#22c55e' : '#94a3b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: paymentReceived ? 'pointer' : 'not-allowed'
                        }}
                    >
                        🏁 End Ride
                    </button>
                </motion.div>
            )}

            {/* Trip Completed */}
            {rideStatus === 'completed' && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        backgroundColor: '#f0fdf4',
                        padding: '30px',
                        borderRadius: '15px',
                        border: '2px solid #22c55e',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '64px', marginBottom: '15px' }}>🎉</div>
                    <h3 style={{ color: '#166534', marginBottom: '10px' }}>Trip Completed Successfully!</h3>
                    <p style={{ color: '#15803d', marginBottom: '20px' }}>
                        Payment of ₹{ride.fare || 250} has been collected.
                    </p>
                    <button style={{
                        padding: '12px 30px',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        🚗 Find Next Ride
                    </button>
                </motion.div>
            )}
        </div>
    );
}