import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/main.css';

export default function AnalyticsWidget() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${config.API_BASE_URL}/admin/analytics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data);
        setError('');
      } catch (err) {
        console.error('Error fetching analytics:', err.response?.status, err.response?.data);
        let errorMessage = 'Failed to load analytics';
        
        if (err.response?.status === 400) {
          errorMessage = 'Authentication or permission issue';
        } else if (err.response?.status === 401) {
          errorMessage = 'Invalid authentication token';
        } else if (err.response?.status === 403) {
          errorMessage = 'Insufficient permissions - admin access required';
        }
        
        setError(errorMessage);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Optional: Add Socket.io for live updates here
  }, []);

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#718096'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p>Loading analytics...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{
      padding: '30px',
      backgroundColor: '#fed7d7',
      borderRadius: '15px',
      border: '1px solid #feb2b2',
      textAlign: 'center',
      color: '#c53030'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
      <h3 style={{ marginBottom: '10px', color: '#c53030' }}>Error Loading Analytics</h3>
      <p>{error}</p>
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '25px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          marginRight: '15px'
        }}>
          📊
        </div>
        <h3 style={{
          color: '#2d3748',
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Daily Analytics
        </h3>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f7fafc',
          borderRadius: '15px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#667eea',
            marginBottom: '8px'
          }}>
            {stats.total_rides}
          </div>
          <div style={{
            color: '#718096',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Total Rides
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#f7fafc',
          borderRadius: '15px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#38a169',
            marginBottom: '8px'
          }}>
            ₹{stats.total_earnings}
          </div>
          <div style={{
            color: '#718096',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Total Earnings
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#f7fafc',
          borderRadius: '15px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ed8936',
            marginBottom: '8px'
          }}>
            {stats.active_drivers}
          </div>
          <div style={{
            color: '#718096',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Active Drivers
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#f7fafc',
          borderRadius: '15px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#9f7aea',
            marginBottom: '8px'
          }}>
            {stats.active_users}
          </div>
          <div style={{
            color: '#718096',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Active Users
          </div>
        </div>
      </div>
    </div>
  );
}