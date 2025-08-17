import React from 'react';
import Navbar from '../components/Navbar';
import AnalyticsWidget from '../components/AnalyticsWidget';
import '../styles/main.css';

export default function AdminDashboard({ user }) {
  return (
    <div>
      <Navbar user={user} />
      <h2>Admin Dashboard</h2>
      <AnalyticsWidget />
      <p>Manage vehicles, drivers, and rides here.</p>
    </div>
  );
}