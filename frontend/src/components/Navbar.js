import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CookieManager from '../utils/cookieManager';
import '../styles/main.css';

export default function Navbar({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Left Section - Logo */}
      <div>
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            🚗
          </div>
          CarRental
        </Link>
      </div>

      {/* Center Section - Navigation Links */}
      <div className="navbar-center">
        <Link to="/" className="navbar-link">
          🏠 Home
        </Link>
        
        <Link to="/vehicles" className="navbar-link">
          🚙 Vehicles
        </Link>
        
        <Link to="/bookings" className="navbar-link">
          📋 Your Rides
        </Link>
        
        <Link to="/contact" className="navbar-link">
          📞 Contact Us
        </Link>
        
        {user?.role === 'admin' && (
          <Link to="/admin" className="navbar-link navbar-admin">
            👑 Admin
          </Link>
        )}
      </div>

      {/* Right Section - Authentication */}
      <div className="navbar-auth">
        {!user ? (
          <>
            <Link to="/login" className="auth-btn login">
              🔑 Login
            </Link>
            
            <Link to="/signup" className="auth-btn signup">
              ✨ Sign Up
            </Link>
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
              
              <button
                onClick={() => {
                  CookieManager.clearUserSession();
                  window.location.href = '/';
                }}
                className="dropdown-item logout"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}