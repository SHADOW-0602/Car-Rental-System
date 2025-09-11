import React, { useEffect, useState } from 'react';
import socket from '../services/socket';
import { useAuthContext } from '../context/AuthContext';

export default function RideNotifications() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Listen for ride-related notifications
    const handleRideAccepted = (data) => {
      showNotification({
        type: 'success',
        title: 'Ride Accepted!',
        message: `Your ride has been accepted by ${data.driver?.name}`,
        duration: 5000
      });
    };

    const handleTripStarted = (data) => {
      showNotification({
        type: 'info',
        title: 'Trip Started',
        message: 'Your trip has started. Enjoy your ride!',
        duration: 4000
      });
    };

    const handleRideCompleted = (data) => {
      showNotification({
        type: 'success',
        title: 'Trip Completed!',
        message: 'Your trip has been completed. Please proceed with payment.',
        duration: 6000,
        action: {
          text: 'Pay Now',
          onClick: () => {
            // Redirect to payment or trigger payment modal
            window.location.href = `/track-ride/${data.rideId}`;
          }
        }
      });
    };

    // Subscribe to user-specific notifications
    socket.on(`user_notification_${user.id}`, (data) => {
      switch (data.type) {
        case 'ride_accepted':
          handleRideAccepted(data);
          break;
        case 'trip_started':
          handleTripStarted(data);
          break;
        case 'ride_completed':
          handleRideCompleted(data);
          break;
        default:
          showNotification({
            type: 'info',
            title: 'Notification',
            message: data.message,
            duration: 4000
          });
      }
    });

    return () => {
      socket.off(`user_notification_${user.id}`);
    };
  }, [user]);

  const showNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 4000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: `2px solid ${getNotificationColor(notification.type)}`,
            animation: 'slideInRight 0.3s ease-out',
            position: 'relative'
          }}
        >
          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '4px'
            }}
          >
            ×
          </button>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              fontSize: '24px',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {getNotificationIcon(notification.type)}
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 4px 0',
                color: '#1f2937',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {notification.title}
              </h4>
              
              <p style={{
                margin: '0 0 12px 0',
                color: '#4b5563',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {notification.message}
              </p>
              
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  style={{
                    backgroundColor: getNotificationColor(notification.type),
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {notification.action.text}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <style>{`
        @keyframes slideInRight {
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