import React from 'react';
import Navbar from '../components/Navbar';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import '../styles/main.css';

export default function AnalyticsDashboard({ user }) {
  const { stats } = useAnalyticsContext();

  return (
    <div>
      <Navbar user={user} />
      <h2 style={{ marginTop: '1rem' }}>Analytics Dashboard</h2>

      {!stats ? (
        <p>Loading analytics...</p>
      ) : (
        <div
          style={{
            background: '#f5fafc',
            border: '1.5px solid #b0c4de',
            borderRadius: '10px',
            padding: '1.1rem 1.8rem',
            boxShadow: '0 1px 7px rgba(25, 118, 210, 0.07)',
            maxWidth: '350px',
            marginTop: '1rem'
          }}
        >
          <h3 style={{ color: '#1255a2', marginBottom: '1rem' }}>
            Daily Analytics
          </h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li>Total Rides: {stats.total_rides}</li>
            <li>Total Earnings: ₹{stats.total_earnings}</li>
            <li>Active Drivers: {stats.active_drivers}</li>
            <li>Active Users: {stats.active_users}</li>
          </ul>
        </div>
      )}
    </div>
  );
}