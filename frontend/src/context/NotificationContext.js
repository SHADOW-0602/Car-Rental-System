import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../services/socket';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState('');

  useEffect(() => {
    socket.on('notification', data => setNotification(data.message));
    socket.on('newRideRequest', data => setNotification(`New ride request from user ${data.ride.user_id}!`));
    return () => {
      socket.off('notification');
      socket.off('newRideRequest');
    };
  }, []);

  // Optionally, clear notification after a timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  return useContext(NotificationContext);
}