import React, { useEffect, useState } from 'react';
import socket from '../services/socket';
import '../styles/main.css';

export default function NotificationBanner() {
  const [notification, setNotification] = useState('');

  useEffect(() => {
    socket.on('newRideRequest', data => {
      setNotification(`New ride request from user ${data.ride.user_id}!`);
    });

    // Example: listen for generic notifications
    socket.on('notification', data => {
      setNotification(data.message);
    });
    return () => {
      socket.off('newRideRequest');

      socket.off('notification');
    };
  }, []);

  if (!notification) return null;
  return (
    <div className="notification-banner">
      {notification}
    </div>
  );
}