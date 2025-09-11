import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import api from '../services/api';
import io from 'socket.io-client';

export default function DriverNotifications() {
    const { user } = useAuthContext();
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'driver') return;

        const newSocket = io('http://localhost:5000', {
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('connect', () => {
            console.log('Driver connected for notifications');
        });

        // Listen for ride requests
        newSocket.on(`driver_notification_${user.id}`, (notification) => {
            console.log('Received ride request:', notification);
            setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 latest
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification('New Ride Request!', {
                    body: `${notification.message} - ₹${notification.fare}`,
                    icon: '/assets/icon.png'
                });
            }
        });

        setSocket(newSocket);

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const acceptRide = async (rideId) => {
        try {
            const response = await api.put(`/rides/${rideId}/accept`);
            if (response.data.success) {
                alert('Ride accepted successfully!');
                // Remove notification from list
                setNotifications(prev => prev.filter(n => n.rideId !== rideId));
            }
        } catch (error) {
            alert('Failed to accept ride: ' + (error.response?.data?.error || error.message));
        }
    };

    const dismissNotification = (rideId) => {
        setNotifications(prev => prev.filter(n => n.rideId !== rideId));
    };

    if (!user || user.role !== 'driver' || notifications.length === 0) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            maxWidth: '400px'
        }}>
            {notifications.map((notification, index) => (
                <div
                    key={`${notification.rideId}-${index}`}
                    style={{
                        backgroundColor: 'white',
                        border: '2px solid #f59e0b',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '15px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        animation: 'slideIn 0.3s ease-out'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '15px'
                    }}>
                        <div>
                            <h4 style={{
                                margin: '0 0 5px 0',
                                color: '#1e293b',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                🚗 New Ride Request
                            </h4>
                            <p style={{
                                margin: 0,
                                color: '#64748b',
                                fontSize: '12px'
                            }}>
                                {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                        <button
                            onClick={() => dismissNotification(notification.rideId)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '18px',
                                cursor: 'pointer',
                                color: '#64748b'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{
                            display: 'grid',
                            gap: '8px',
                            fontSize: '14px'
                        }}>
                            <div><strong>📍 From:</strong> {notification.pickup}</div>
                            <div><strong>🎯 To:</strong> {notification.destination}</div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <span><strong>💰 Fare:</strong> ₹{notification.fare}</span>
                                <span><strong>📏 Distance:</strong> {notification.distance} km</span>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <span><strong>🚗 Vehicle:</strong> {notification.vehicle_type}</span>
                                <span><strong>💳 Payment:</strong> {notification.payment_method}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            onClick={() => dismissNotification(notification.rideId)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#64748b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={() => acceptRide(notification.rideId)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        >
                            Accept Ride
                        </button>
                    </div>
                </div>
            ))}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}