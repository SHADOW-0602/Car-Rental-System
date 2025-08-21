import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CookieManager from '../utils/cookieManager';
import '../styles/main.css';
import { slideDown, staggerContainer, staggerItem } from '../animations/variants';
import { AnimatedButton } from '../animations/AnimatedComponents';

export default function Navbar({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <motion.nav 
      className="navbar"
      variants={slideDown}
      initial="hidden"
      animate="visible"
    >
      {/* Left Section - Logo */}
      <div>
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            🚗
          </div>
          CarRental
        </Link>
      </div>

      {/* Center Section - Role-based Navigation */}
      <div className="navbar-center">
        {/* No navigation links for non-signed users */}
        
        {user?.role === 'user' && (
          <>
            <Link to="/user/portal" className="navbar-link">🏠 Dashboard</Link>
            <Link to="/vehicles" className="navbar-link">🚙 Find Rides</Link>
            <Link to="/bookings" className="navbar-link">📋 My Rides</Link>
            <Link to="/contact" className="navbar-link">📞 Support</Link>
          </>
        )}
        
        {user?.role === 'driver' && (
          <>
            <Link to="/driver/portal" className="navbar-link">🏠 Dashboard</Link>
            <Link to="/driver/rides" className="navbar-link">🚗 My Rides</Link>
            <Link to="/driver/earnings" className="navbar-link">💰 Earnings</Link>
            <Link to="/contact" className="navbar-link">📞 Support</Link>
          </>
        )}
        
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/portal" className="navbar-link">🏠 Dashboard</Link>
            <Link to="/admin/analytics" className="navbar-link">📊 Analytics</Link>
            <Link to="/admin/users" className="navbar-link">👥 Users</Link>
            <Link to="/admin/chat" className="navbar-link">💬 Support</Link>
          </>
        )}
      </div>

      {/* Right Section - Authentication */}
      <div className="navbar-auth">
        {!user ? (
          <>
            <Link to="/login" className="auth-btn login">🔑 Login</Link>
            <Link to="/signup" className="auth-btn signup">✨ Sign Up</Link>
            <Link to="/driver/register" className="auth-btn driver-signup">🚕 Drive & Earn</Link>
          </>
        ) : (
          <div className="user-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="user-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: user.profile_image 
                  ? `url(${user.profile_image}) center/cover` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: 'white',
                fontWeight: 'bold',
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                {!user.profile_image && (user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <span>{user.name || user.email}</span>
              <span style={{ fontSize: '12px' }}>▼</span>
            </button>
            
            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <div style={{
                padding: '15px',
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {user.name || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {user.email}
                </div>
                {user.phone && (
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                    📞 {user.phone}
                  </div>
                )}
              </div>
              
              <Link 
                to="/profile" 
                className="dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                👤 Update Profile
              </Link>
              
              <Link 
                to="/bookings" 
                className="dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                📋 My Bookings
              </Link>
              
              <Link 
                to="/settings" 
                className="dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                ⚙️ Settings
              </Link>
              
              <Link 
                to="/help" 
                className="dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                ❓ Help & Support
              </Link>
              
              <AnimatedButton
                onClick={() => {
                  CookieManager.clearUserSession();
                  window.location.href = '/';
                }}
                className="dropdown-item logout"
              >
                🚪 Logout
              </AnimatedButton>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
}