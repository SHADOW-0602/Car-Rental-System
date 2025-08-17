import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../services/socket';
import config from '../config';

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found');
          return;
        }
        
        const res = await axios.get(
          `${config.API_BASE_URL}/admin/analytics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
      } catch (err) {
        console.error('Analytics fetch error:', err.response?.status, err.response?.data);
        if (err.response?.status === 400) {
          console.log('Bad request - likely authentication or permission issue');
        } else if (err.response?.status === 401) {
          console.log('Unauthorized - invalid token');
        } else if (err.response?.status === 403) {
          console.log('Forbidden - insufficient permissions');
        }
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
