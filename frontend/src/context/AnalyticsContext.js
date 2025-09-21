import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../services/socket';
import config from '../config';
import CookieManager from '../utils/cookieManager';

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [operationQueue, setOperationQueue] = useState([]);

  // Track operation function
  const trackOperation = async (operation) => {
    const { user } = CookieManager.getUserSession();
    const timestamp = new Date().toISOString();
    
    const analyticsData = {
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous',
      userName: user?.name || 'Anonymous User',
      userRole: user?.role || 'user',
      operation: operation.type,
      details: operation.details || {},
      metadata: {
        timestamp,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: sessionStorage.getItem('sessionId') || 'no-session',
        ...operation.metadata
      }
    };

    try {
      // Send to backend immediately
      await axios.post(`${config.API_BASE_URL}/analytics/track`, analyticsData, {
        headers: {
          'Authorization': `Bearer ${CookieManager.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Also emit via socket for real-time admin updates
      if (socket.connected) {
        socket.emit('analytics_event', analyticsData);
      }
    } catch (error) {
      // Queue for retry if failed
      setOperationQueue(prev => [...prev, analyticsData]);
      console.log('Analytics tracking queued:', operation.type);
    }
  };

  // Retry queued operations
  useEffect(() => {
    if (operationQueue.length > 0) {
      const retryInterval = setInterval(async () => {
        const queuedOps = [...operationQueue];
        setOperationQueue([]);
        
        for (const op of queuedOps) {
          try {
            await axios.post(`${config.API_BASE_URL}/analytics/track`, op, {
              headers: {
                'Authorization': `Bearer ${CookieManager.getToken()}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            setOperationQueue(prev => [...prev, op]);
          }
        }
      }, 30000); // Retry every 30 seconds

      return () => clearInterval(retryInterval);
    }
  }, [operationQueue]);

  // Initialize session tracking
  useEffect(() => {
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', Date.now().toString());
    }
    
    const { user } = CookieManager.getUserSession();
    if (user) {
      trackOperation({
        type: 'SESSION_START',
        details: { loginMethod: 'existing_session' }
      });
    }
  }, []);

  return (
    <AnalyticsContext.Provider value={{ stats, trackOperation }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  return useContext(AnalyticsContext);
}
