import React, { useState, useEffect } from 'react';
import { useMultiTabAuth } from '../context/MultiTabAuthContext';
import MultiTabDashboard from './MultiTabDashboard';
import UserPortal from '../pages/UserPortal';
import DriverPortal from '../pages/DriverPortal';
import AdminPortal from '../pages/AdminPortal';

export default function MultiTabApp() {
  const { currentAuth, isLoading } = useMultiTabAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showMultiTab, setShowMultiTab] = useState(true);

  // Auto-hide multi-tab dashboard after role selection
  useEffect(() => {
    if (currentAuth.role && currentView !== 'dashboard') {
      setShowMultiTab(false);
    }
  }, [currentAuth.role, currentView]);

  const handleTabSelect = (tabId, role) => {
    setCurrentView(role);
    setShowMultiTab(false);
  };

  const handleRoleSwitch = (tabId, newRole) => {
    setCurrentView(newRole);
    setShowMultiTab(false);
  };

  const handleShowMultiTab = () => {
    setShowMultiTab(true);
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
          <h2>Loading Multi-Tab System...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="multi-tab-app">
      {/* Multi-Tab Dashboard */}
      {showMultiTab && (
        <div className="multi-tab-overlay">
          <MultiTabDashboard 
            onTabSelect={handleTabSelect}
            onRoleSwitch={handleRoleSwitch}
          />
        </div>
      )}

      {/* Role-based Portal */}
      {!showMultiTab && currentAuth.role && (
        <div className="role-portal">
          {/* Multi-Tab Toggle Button */}
          <div className="multi-tab-toggle">
            <button 
              className="btn-secondary"
              onClick={handleShowMultiTab}
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                padding: '10px 15px',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              🔄 Multi-Tab Manager
            </button>
          </div>

          {/* Role-specific Portal */}
          {currentView === 'user' && <UserPortal />}
          {currentView === 'driver' && <DriverPortal />}
          {currentView === 'admin' && <AdminPortal />}
        </div>
      )}

      {/* No Role Selected */}
      {!showMultiTab && !currentAuth.role && (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚀</div>
            <h1 style={{ marginBottom: '20px', color: '#2d3748' }}>
              Welcome to Multi-Tab Car Rental System
            </h1>
            <p style={{ marginBottom: '30px', color: '#718096', fontSize: '1.1rem' }}>
              This system allows you to run multiple user roles simultaneously across different browser tabs.
            </p>
            <button 
              className="btn-primary"
              onClick={handleShowMultiTab}
              style={{ padding: '15px 30px', fontSize: '1.1rem' }}
            >
              Open Multi-Tab Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

