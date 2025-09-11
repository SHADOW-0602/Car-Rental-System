import React from 'react';
import { theme } from '../../styles/theme';

const MobileLayout = ({ children, showBottomNav = false, className = '' }) => {
  const layoutStyle = {
    minHeight: '100vh',
    backgroundColor: theme.colors.secondary[50],
    paddingBottom: showBottomNav ? '80px' : '0'
  };

  const containerStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 16px'
  };

  return (
    <div style={layoutStyle} className={`mobile-layout ${className}`}>
      <div style={containerStyle}>
        {children}
      </div>
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
};

const MobileBottomNav = () => {
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderTop: `1px solid ${theme.colors.secondary[200]}`,
    padding: '8px 0',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center'
  };

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🚗', label: 'Rides', path: '/rides' },
    { icon: '💰', label: 'Wallet', path: '/wallet' },
    { icon: '👤', label: 'Profile', path: '/profile' }
  ];

  return (
    <nav style={navStyle} className="mobile-nav">
      {navItems.map((item, index) => (
        <a
          key={index}
          href={item.path}
          className="mobile-nav-item touch-target"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: theme.colors.secondary[600],
            fontSize: '12px',
            padding: '8px',
            minWidth: '44px'
          }}
        >
          <span style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
};

export default MobileLayout;