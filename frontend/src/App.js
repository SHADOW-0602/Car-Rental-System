import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

import CarList from './pages/CarList';
import CarDetails from './pages/CarDetails';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SimpleLogin from './components/SimpleLogin';
import SignupForm from './components/SignupForm';
import DriverRegister from './pages/DriverRegister';
import DriverEarnings from './pages/DriverEarnings';
import DriverRides from './pages/DriverRides';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import About from './pages/About';
import AdminChat from './pages/AdminChat';

import UserPortal from './pages/UserPortal';
import DriverPortal from './pages/DriverPortal';
import AdminPortal from './pages/AdminPortal';
import AdminUsers from './pages/AdminUsers';
import ProtectedRoute from './components/ProtectedRoute';

import NotificationBanner from './components/NotificationBanner';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import './utils/errorHandler'; // Initialize global error handlers

function AppRoutes() {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '2rem' }}
        >
          🚗
        </motion.div>
      </motion.div>
    );
  }
  
  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/portal';
      case 'driver': return '/driver/portal';
      case 'user': return '/user/portal';
      default: return '/';
    }
  };
  
  return (
    <Router>
      <NotificationBanner />
      <CookieConsent />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={user ? <Navigate to={getDashboardRoute()} replace /> : <UserPortal user={user} />} />
          <Route path="/dashboard" element={<UserPortal user={user} />} />
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/driver/register" element={<DriverRegister />} />
          <Route path="/vehicles" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <CarList />
            </ProtectedRoute>
          } />
          <Route path="/vehicles/:id" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <CarDetails />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Bookings />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={
            <ProtectedRoute allowedRoles={['user', 'driver', 'admin']}>
              <Contact />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['user', 'driver', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['user', 'driver', 'admin']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute allowedRoles={['user', 'driver', 'admin']}>
              <Help />
            </ProtectedRoute>
          } />
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
          <Route path="/driver/rides" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverRides />
            </ProtectedRoute>
          } />
          <Route path="/driver/earnings" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverEarnings />
            </ProtectedRoute>
          } />
          <Route path="/admin/portal" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPortal />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
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