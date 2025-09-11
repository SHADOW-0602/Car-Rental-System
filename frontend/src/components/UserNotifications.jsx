import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

export default function UserNotifications() {
    const { user } = useAuthContext();
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'user') return;

        const newSocket = io('http://localhost:5000', {
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('connect', () => {
            console.log('User connected for notifications');
        });

        // Listen for ride updates
        newSocket.on(`user_notification_${user.id}`, (notification) => {
            console.log('Received ride update:', notification);
            setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 latest
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification('Ride Update!', {
                    body: notification.message,
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

    const dismissNotification = (timestamp) => {
        setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
    };

    if (!user || user.role !== 'user' || notifications.length === 0) {
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
                    key={`${notification.timestamp}-${index}`}
                    style={{
                        backgroundColor: 'white',
                        border: notification.type === 'ride_accepted' ? '2px solid #22c55e' : 
                               notification.type === 'trip_started' ? '2px solid #3b82f6' : '2px solid #f59e0b',
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
                                {notification.type === 'ride_accepted' ? '✅ Ride Accepted!' :
                                 notification.type === 'trip_started' ? '🚗 Trip Started!' :
                                 notification.type === 'ride_status_update' ? '📱 Ride Update' :
                                 '🔔 Notification'}
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
                            onClick={() => dismissNotification(notification.timestamp)}
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
                        <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5'
                        }}>
                            {notification.message}
                        </p>
                        
                        {notification.driver && (
                            <div style={{
                                marginTop: '10px',
                                padding: '10px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                fontSize: '13px'
                            }}>
                                <div><strong>Driver:</strong> {notification.driver.name}</div>
                                <div><strong>Phone:</strong> {notification.driver.phone}</div>
                                {notification.driver.rating && (
                                    <div><strong>Rating:</strong> {notification.driver.rating}/5 ⭐</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            onClick={() => dismissNotification(notification.timestamp)}
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