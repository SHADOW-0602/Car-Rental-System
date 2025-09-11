import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function RideTracker({ pickup, destination, onComplete }) {
    const [currentPosition, setCurrentPosition] = useState(0);
    const [isTracking, setIsTracking] = useState(false);
    const [rideStatus, setRideStatus] = useState('waiting'); // waiting, in_progress, completed

    const startTracking = () => {
        setIsTracking(true);
        setRideStatus('in_progress');
        
        // Simulate ride progress
        const interval = setInterval(() => {
            setCurrentPosition(prev => {
                const newPos = prev + 2;
                if (newPos >= 100) {
                    clearInterval(interval);
                    setRideStatus('completed');
                    setIsTracking(false);
                    onComplete && onComplete();
                    return 100;
                }
                return newPos;
            });
        }, 200);
    };

    const resetTracking = () => {
        setCurrentPosition(0);
        setRideStatus('waiting');
        setIsTracking(false);
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        }}>
            <h3 style={{ marginBottom: '20px', color: '#2d3748', textAlign: 'center' }}>
                🚴 Live Ride Tracking
            </h3>
            
            {/* Route Display */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '15px'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>From</div>
                    <div style={{ fontWeight: '600', color: '#2d3748' }}>{pickup || 'Pickup Location'}</div>
                </div>
                <div style={{ margin: '0 20px', fontSize: '24px' }}>→</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>To</div>
                    <div style={{ fontWeight: '600', color: '#2d3748' }}>{destination || 'Destination'}</div>
                </div>
            </div>

            {/* Tracking Route */}
            <div style={{
                position: 'relative',
                height: '80px',
                backgroundColor: '#f1f5f9',
                borderRadius: '40px',
                marginBottom: '20px',
                overflow: 'hidden'
            }}>
                {/* Route Line */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '40px',
                    right: '40px',
                    height: '4px',
                    backgroundColor: '#e2e8f0',
                    transform: 'translateY(-50%)',
                    borderRadius: '2px'
                }}>
                    {/* Progress Line */}
                    <motion.div
                        style={{
                            height: '100%',
                            backgroundColor: '#22c55e',
                            borderRadius: '2px'
                        }}
                        animate={{ width: `${currentPosition}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Start Point */}
                <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold'
                }}>
                    A
                </div>

                {/* End Point */}
                <div style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold'
                }}>
                    B
                </div>

                {/* Moving Bike */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '50px',
                        height: '50px',
                        zIndex: 10
                    }}
                    animate={{
                        left: `${Math.max(40, Math.min(currentPosition * 0.8 + 40, 80))}px`
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.img
                        src="/assets/Bike Symbol.png"
                        alt="Bike"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                        animate={isTracking ? {
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                        } : {}}
                        transition={{
                            duration: 0.5,
                            repeat: isTracking ? Infinity : 0
                        }}
                    />
                </motion.div>
            </div>

            {/* Status Display */}
            <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: 
                    rideStatus === 'waiting' ? '#fef3c7' :
                    rideStatus === 'in_progress' ? '#dbeafe' : '#dcfce7',
                borderRadius: '10px',
                border: `2px solid ${
                    rideStatus === 'waiting' ? '#f59e0b' :
                    rideStatus === 'in_progress' ? '#3b82f6' : '#22c55e'
                }`
            }}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 
                        rideStatus === 'waiting' ? '#92400e' :
                        rideStatus === 'in_progress' ? '#1e40af' : '#166534'
                }}>
                    {rideStatus === 'waiting' && '⏳ Waiting for ride to start'}
                    {rideStatus === 'in_progress' && '🚴 Ride in progress...'}
                    {rideStatus === 'completed' && '✅ Ride completed!'}
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginTop: '5px'
                }}>
                    Progress: {currentPosition.toFixed(0)}%
                </div>
            </div>

            {/* Control Buttons */}
            <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center'
            }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startTracking}
                    disabled={isTracking || rideStatus === 'completed'}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: (isTracking || rideStatus === 'completed') ? '#94a3b8' : '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: (isTracking || rideStatus === 'completed') ? 'not-allowed' : 'pointer'
                    }}
                >
                    {rideStatus === 'completed' ? '✅ Completed' : isTracking ? '🚴 Tracking...' : '🚀 Start Ride'}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTracking}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Reset
                </motion.button>
            </div>
        </div>
    );
}