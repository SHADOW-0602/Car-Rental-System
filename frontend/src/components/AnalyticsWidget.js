import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnalyticsWidget() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/analytics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data);
        setError('');
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Optional: Add Socket.io for live updates here
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="analytics-widget">
      <h3>Daily Analytics</h3>
      <ul>
        <li>Total Rides: {stats.total_rides}</li>
        <li>Total Earnings: ₹{stats.total_earnings}</li>
        <li>Active Drivers: {stats.active_drivers}</li>
        <li>Active Users: {stats.active_users}</li>
      </ul>
    </div>
  );
}