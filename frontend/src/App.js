import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

import Home from './pages/Home';
import CarList from './pages/CarList';
import CarDetails from './pages/CarDetails';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SimpleLogin from './components/SimpleLogin';
import SignupForm from './components/SignupForm';
import DriverRegister from './pages/DriverRegister';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AdminChat from './pages/AdminChat';
import UserPortal from './pages/UserPortal';
import DriverPortal from './pages/DriverPortal';
import AdminPortal from './pages/AdminPortal';
import ProtectedRoute from './components/ProtectedRoute';

import NotificationBanner from './components/NotificationBanner';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import './utils/errorHandler'; // Initialize global error handlers

function AppRoutes() {
  const { user } = useAuthContext();
  
  return (
    <Router>
      <NotificationBanner />
      <CookieConsent />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/driver/register" element={<DriverRegister />} />
          <Route path="/vehicles" element={<CarList />} />
          <Route path="/vehicles/:id" element={<CarDetails />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/chat" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminChat />
            </ProtectedRoute>
          } />
          <Route path="/user/portal" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserPortal />
            </ProtectedRoute>
          } />
          <Route path="/driver/portal" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverPortal />
            </ProtectedRoute>
          } />
          <Route path="/admin/portal" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPortal />
            </ProtectedRoute>
          } />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AnalyticsProvider>
            <AppRoutes />
          </AnalyticsProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}