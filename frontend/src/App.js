import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

import Home from './pages/Home';
import CarList from './pages/CarList';
import CarDetails from './pages/CarDetails';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

import NotificationBanner from './components/NotificationBanner';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AnalyticsProvider>
          <Router>
            <NotificationBanner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vehicles" element={<CarList />} />
              <Route path="/vehicles/:id" element={<CarDetails />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </Router>
        </AnalyticsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}