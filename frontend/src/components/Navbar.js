import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CookieManager from '../utils/cookieManager';
import VerifiedBadge from './VerifiedBadge';
import Button from './ui/Button';
import { theme } from '../styles/theme';
import { slideDown } from '../animations/variants';

export default function Navbar({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.white,
    borderBottom: `1px solid ${theme.colors.secondary[200]}`,
    boxShadow: theme.shadows.sm,
    position: 'sticky',
    top: 0,
    zIndex: 1000
  };

  const mobileMenuStyle = {
    position: 'fixed',
    top: '70px',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderBottom: `1px solid ${theme.colors.secondary[200]}`,
    boxShadow: theme.shadows.lg,
    padding: theme.spacing.lg,
    display: isMobileMenuOpen ? 'block' : 'none',
    zIndex: 999
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    textDecoration: 'none',
    color: theme.colors.primary[500],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold
  };

  const navLinksStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.lg,
    '@media (max-width: 768px)': {
      display: 'none'
    }
  };

  const mobileNavLinksStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg
  };

  const linkStyle = {
    textDecoration: 'none',
    color: theme.colors.secondary[700],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    transition: 'all 0.2s ease'
  };

  return (
    <motion.nav 
      style={navStyle}
      variants={slideDown}
      initial="hidden"
      animate="visible"
    >
      <div>
        <Link to="/" style={logoStyle}>
          <span style={{ fontSize: '28px' }}>🚗</span>
          UrbanFleet
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div style={navLinksStyle} className="hidden md:flex">
        {user?.role === 'user' && (
          <>
            <Link to="/user/portal" style={linkStyle}>🏠 Dashboard</Link>
            <Link to="/about" style={linkStyle}>ℹ️ About</Link>
          </>
        )}
        
        {user?.role === 'driver' && (
          <>
            <Link to="/driver/portal" style={linkStyle}>🏠 Dashboard</Link>
            <Link to="/about" style={linkStyle}>ℹ️ About</Link>
            <Link to="/driver/earnings" style={linkStyle}>💰 Earnings</Link>
          </>
        )}
        
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/portal" style={linkStyle}>🏠 Dashboard</Link>
            <Link to="/about" style={linkStyle}>ℹ️ About</Link>
          </>
        )}
        
        {!user && (
          <>
            <Link to="/about" style={linkStyle}>About</Link>
            <Link to="/driver/register" style={linkStyle}>Become a driver</Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden touch-target"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: theme.colors.secondary[700]
        }}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, order: 2 }} className="hidden md:flex">
        {!user ? (
          <>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="tab-btn active" style={{
                backgroundColor: 'transparent !important',
                color: '#0099ff !important',
                border: '2px solid #0099ff'
              }}>Log in</button>
            </Link>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <button className="tab-btn active" style={{
                backgroundColor: '#0099ff !important',
                color: 'white !important',
                border: '2px solid #0099ff'
              }}>Sign up</button>
            </Link>
          </>
        ) : (
          <>

            <div style={{ position: 'relative', order: user ? 2 : 0 }} className="profile-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
                padding: theme.spacing.sm,
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: user.profile_image 
                  ? `url(${user.profile_image}) center/cover` 
                  : `linear-gradient(135deg, ${theme.colors.secondary[900]} 0%, ${theme.colors.secondary[700]} 100%)`, // Charcoal Gray gradient
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.white,
                fontWeight: theme.typography.fontWeight.semibold,
                border: `2px solid ${theme.colors.secondary[500]}` // Silver border
              }}>
                {!user.profile_image && (user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.secondary[700]
              }}>
                {user.name || user.email}
                {user.role === 'driver' && <VerifiedBadge isVerified={user.driverInfo?.isVerified} />}
              </span>
              <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.secondary[500] }}>▼</span>
            </button>
            
            {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: theme.spacing.sm,
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.lg,
              border: `1px solid ${theme.colors.secondary[200]}`,
              minWidth: '250px',
              maxWidth: '90vw',
              zIndex: 1000
            }}>
              <div style={{
                padding: theme.spacing.lg,
                borderBottom: `1px solid ${theme.colors.secondary[200]}`,
                backgroundColor: theme.colors.secondary[50]
              }}>
                <div style={{ 
                  fontWeight: theme.typography.fontWeight.semibold, 
                  color: theme.colors.secondary[900], 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: theme.typography.fontSize.base
                }}>
                  {user.name || 'User'}
                  {user.role === 'driver' && <VerifiedBadge isVerified={user.driverInfo?.isVerified} />}
                </div>
                <div style={{ 
                  fontSize: theme.typography.fontSize.sm, 
                  color: theme.colors.secondary[600],
                  marginTop: theme.spacing.xs
                }}>
                  {user.email}
                </div>
                {user.phone && (
                  <div style={{ 
                    fontSize: theme.typography.fontSize.xs, 
                    color: theme.colors.secondary[500], 
                    marginTop: theme.spacing.xs
                  }}>
                    📞 {user.phone}
                  </div>
                )}
              </div>
              
              {user.role !== 'admin' && (
                <>
                  <Link 
                    to="/profile" 
                    style={{
                      display: 'block',
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      textDecoration: 'none',
                      color: theme.colors.secondary[700],
                      fontSize: theme.typography.fontSize.sm,
                      transition: 'all 0.2s ease',
                      borderRadius: theme.borderRadius.md
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    👤 Update Profile
                  </Link>
                  
                  {user.role !== 'driver' && (
                    <Link 
                      to="/bookings" 
                      style={{
                        display: 'block',
                        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                        textDecoration: 'none',
                        color: theme.colors.secondary[700],
                        fontSize: theme.typography.fontSize.sm,
                        transition: 'all 0.2s ease',
                        borderRadius: theme.borderRadius.md
                      }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      📋 My Bookings
                    </Link>
                  )}
                  
                  <Link 
                    to={user.role === 'driver' ? '/driver/settings' : '/user/settings'} 
                    style={{
                      display: 'block',
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      textDecoration: 'none',
                      color: theme.colors.secondary[700],
                      fontSize: theme.typography.fontSize.sm,
                      transition: 'all 0.2s ease',
                      borderRadius: theme.borderRadius.md
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  
                  <Link 
                    to="/help" 
                    style={{
                      display: 'block',
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      textDecoration: 'none',
                      color: theme.colors.secondary[700],
                      fontSize: theme.typography.fontSize.sm,
                      transition: 'all 0.2s ease',
                      borderRadius: theme.borderRadius.md
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    ❓ Help & Support
                  </Link>
                </>
              )}
              
              <div style={{ padding: theme.spacing.sm }}>
                <button
                  onClick={() => {
                    CookieManager.clearUserSession();
                    window.location.href = '/';
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
            )}
          </div>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <div style={mobileMenuStyle} className="md:hidden">
        <div style={mobileNavLinksStyle}>
          {user?.role === 'user' && (
            <>
              <Link to="/user/portal" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>🏠 Dashboard</Link>
              <Link to="/about" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>ℹ️ About</Link>
            </>
          )}
          
          {user?.role === 'driver' && (
            <>
              <Link to="/driver/portal" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>🏠 Dashboard</Link>
              <Link to="/about" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>ℹ️ About</Link>
              <Link to="/driver/earnings" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>💰 Earnings</Link>
            </>
          )}
          
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/portal" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>🏠 Dashboard</Link>
              <Link to="/about" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>ℹ️ About</Link>
            </>
          )}
          
          {!user && (
            <>
              <Link to="/about" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
              <Link to="/driver/register" style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>Become a driver</Link>
            </>
          )}
        </div>

        {!user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <Link to="/login" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
              <button className="tab-btn active" style={{
                width: '100%',
                backgroundColor: 'transparent !important',
                color: '#0099ff !important',
                border: '2px solid #0099ff'
              }}>Log in</button>
            </Link>
            <Link to="/signup" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
              <button className="tab-btn active" style={{
                width: '100%',
                backgroundColor: '#0099ff !important',
                color: 'white !important',
                border: '2px solid #0099ff'
              }}>Sign up</button>
            </Link>
            <Link to="/driver/register" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="success" size="sm" style={{ width: '100%' }}>Become a driver</Button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <div style={{ padding: theme.spacing.md, backgroundColor: theme.colors.secondary[50], borderRadius: theme.borderRadius.md }}>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.secondary[900] }}>
                {user.name || 'User'}
              </div>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.secondary[600] }}>
                {user.email}
              </div>
            </div>
            
            {user.role !== 'admin' && (
              <>
                <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" icon="👤" style={{ width: '100%' }}>Update Profile</Button>
                </Link>
                
                {user.role !== 'driver' && (
                  <Link to="/bookings" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" size="sm" icon="📋" style={{ width: '100%' }}>My Bookings</Button>
                  </Link>
                )}
                
                <Link to={user.role === 'driver' ? '/driver/settings' : '/user/settings'} style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" icon="⚙️" style={{ width: '100%' }}>Settings</Button>
                </Link>
                
                <Link to="/help" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" icon="❓" style={{ width: '100%' }}>Help & Support</Button>
                </Link>
              </>
            )}
            
            <button
              onClick={() => {
                CookieManager.clearUserSession();
                window.location.href = '/';
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: '2px solid #ef4444',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}