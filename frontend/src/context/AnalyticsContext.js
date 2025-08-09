import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../services/socket';

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/analytics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
      } catch (err) {
        setStats(null);
      }
    }
    fetchStats();

    // Listen for real-time analytics update
    socket.on('analyticsUpdate', data => setStats(data));
    return () => socket.off('analyticsUpdate');
  }, []);

  return (
    <AnalyticsContext.Provider value={{ stats }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  return useContext(AnalyticsContext);
}
