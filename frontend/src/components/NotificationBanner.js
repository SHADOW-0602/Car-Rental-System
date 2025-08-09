import React, { useEffect, useState } from 'react';
import socket from '../services/socket';

export default function NotificationBanner() {
  const [notification, setNotification] = useState('');

  useEffect(() => {
    socket.on('newRideRequest', data => {
      setNotification(`New ride request from user ${data.ride.user_id}!`);
    });
    socket.on('driverLocationUpdate', data => {
      setNotification(`Live driver update: ${data.driverId} at [${data.latitude},${data.longitude}]`);
    });
    // Example: listen for generic notifications
    socket.on('notification', data => {
      setNotification(data.message);
    });
    return () => {
      socket.off('newRideRequest');
      socket.off('driverLocationUpdate');
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