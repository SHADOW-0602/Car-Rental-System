import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuthContext } from './context/AuthContext';
import { MultiTabAuthProvider } from './context/MultiTabAuthContext';
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
import UserSettings from './pages/UserSettings';
import DriverSettings from './pages/DriverSettings';
import Help from './pages/Help';
import About from './pages/About';
import Safety from './pages/Safety';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Careers from './pages/Careers';
import Services from './pages/Services';
import News from './pages/News';
import Investors from './pages/Investors';
import Blog from './pages/Blog';
import Sustainability from './pages/Sustainability';
import Reserve from './pages/Reserve';
import Airports from './pages/Airports';
import Cities from './pages/Cities';
import Business from './pages/Business';
import GiftCards from './pages/GiftCards';
import Accessibility from './pages/Accessibility';

import UserPortal from './pages/UserPortal';
import DriverPortal from './pages/DriverPortal';
import AdminPortal from './pages/AdminPortal';
import AdminUsers from './pages/AdminUsers';
import TrackRide from './pages/TrackRide';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

import ProtectedRoute from './components/ProtectedRoute';
import MultiTabApp from './components/MultiTabApp';

import NotificationBanner from './components/NotificationBanner';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import RideNotifications from './components/RideNotifications';

import './styles/main.css';

// Page transition component
const PageTransition = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Main App Routes
function AppRoutes() {
  const { user } = useAuthContext();
  
  // Role-based home redirect component
  const RoleBasedHome = () => {
    if (!user) {
      return <UserPortal />;
    }
    
    // Redirect based on user role
    switch (user.role) {
      case 'driver':
        return <Navigate to="/driver" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'user':
      default:
        return <Navigate to="/user" replace />;
    }
  };
  
  return (
    <Router>
      <PageTransition>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RoleBasedHome />} />
          <Route path="/cars" element={<CarList />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/driver-register" element={<DriverRegister />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/news" element={<News />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/reserve" element={<Reserve />} />
          <Route path="/airports" element={<Airports />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/business" element={<Business />} />
          <Route path="/gift-cards" element={<GiftCards />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          
          {/* Multi-Tab System */}
          <Route path="/multi-tab" element={<MultiTabApp />} />
          
          {/* Protected Routes */}
          <Route path="/bookings" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Bookings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['user', 'driver', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['user', 'driver', 'admin']}>
              {user?.role === 'driver' ? <DriverSettings /> : <UserSettings />}
            </ProtectedRoute>
          } />
          <Route path="/track-ride/:rideId" element={<TrackRide />} />
          
          {/* User Portal */}
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserPortal />
            </ProtectedRoute>
          } />
          <Route path="/user/*" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserPortal />
            </ProtectedRoute>
          } />
          
          {/* Driver Portal */}
          <Route path="/driver" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverPortal />
            </ProtectedRoute>
          } />
          <Route path="/driver/earnings" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverEarnings />
            </ProtectedRoute>
          } />
          <Route path="/driver/rides" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverRides />
            </ProtectedRoute>
          } />
          
          {/* Admin Portal */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPortal />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <MultiTabAuthProvider>
        <AuthProvider>
          <NotificationProvider>
            <AnalyticsProvider>
              <div className="App">
                <NotificationBanner />
                <RideNotifications />
                <AppRoutes />
                <CookieConsent />
              </div>
            </AnalyticsProvider>
          </NotificationProvider>
        </AuthProvider>
      </MultiTabAuthProvider>
    </ErrorBoundary>
  );
}

export default App;