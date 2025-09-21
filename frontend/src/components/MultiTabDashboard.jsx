import React, { useState } from 'react';
import { useMultiTabAuth } from '../context/MultiTabAuthContext';
import PropTypes from 'prop-types';

export default function MultiTabDashboard({ onTabSelect, onRoleSwitch }) {
  const { 
    currentTabId, 
    currentAuth, 
    getAllTabs, 
    isRoleAvailable, 
    getAvailableRoles,
    switchRole,
    loginAsRole
  } = useMultiTabAuth();

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'user'
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    const result = await loginAsRole(loginData.email, loginData.password, loginData.role);
    
    if (result.success) {
      setShowLoginForm(false);
      setLoginData({ email: '', password: '', role: 'user' });
      if (onTabSelect) {
        onTabSelect(currentTabId, result.role);
      }
    } else {
      alert(result.error || 'Login failed');
    }
    
    setIsLoggingIn(false);
  };

  const handleRoleSwitch = async (targetRole) => {
    const result = await switchRole(targetRole);
    
    if (result.success) {
      if (onRoleSwitch) {
        onRoleSwitch(currentTabId, targetRole);
      }
    } else {
      alert(result.error || 'Role switch failed');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'user': return '👤';
      case 'driver': return '🚗';
      case 'admin': return '👨‍💼';
      default: return '❓';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'user': return '#3b82f6';
      case 'driver': return '#10b981';
      case 'admin': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const tabs = getAllTabs();
  const availableRoles = getAvailableRoles();

  return (
    <div className="multi-tab-dashboard">
      <div className="dashboard-header">
        <h2>🚀 Multi-Tab Dashboard</h2>
        <p>Manage multiple user roles across browser tabs</p>
      </div>

      {/* Current Tab Status */}
      <div className="current-tab-status">
        <h3>Current Tab Status</h3>
        <div className="tab-card current">
          <div className="tab-info">
            <div className="tab-id">Tab ID: {currentTabId}</div>
            <div className="tab-role">
              {currentAuth.role ? (
                <span 
                  className="role-badge"
                  style={{ backgroundColor: getRoleColor(currentAuth.role) }}
                >
                  {getRoleIcon(currentAuth.role)} {currentAuth.role.toUpperCase()}
                </span>
              ) : (
                <span className="role-badge inactive">Not Logged In</span>
              )}
            </div>
            {currentAuth.user && (
              <div className="user-info">
                <strong>{currentAuth.user.name}</strong>
                <span className="user-email">{currentAuth.user.email}</span>
              </div>
            )}
          </div>
          
          {!currentAuth.role ? (
            <button 
              className="btn-primary"
              onClick={() => setShowLoginForm(true)}
            >
              Login
            </button>
          ) : (
            <div className="tab-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  if (onTabSelect) {
                    onTabSelect(currentTabId, currentAuth.role);
                  }
                }}
              >
                Open Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* All Active Tabs */}
      <div className="all-tabs-section">
        <h3>All Active Tabs ({tabs.length})</h3>
        <div className="tabs-grid">
          {tabs.map((tab) => (
            <div 
              key={tab.id} 
              className={`tab-card ${tab.id === currentTabId ? 'current' : ''}`}
            >
              <div className="tab-info">
                <div className="tab-id">Tab: {tab.id.slice(-8)}</div>
                <div className="tab-role">
                  {tab.role ? (
                    <span 
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(tab.role) }}
                    >
                      {getRoleIcon(tab.role)} {tab.role.toUpperCase()}
                    </span>
                  ) : (
                    <span className="role-badge inactive">Not Logged In</span>
                  )}
                </div>
                {tab.user && (
                  <div className="user-info">
                    <strong>{tab.user.name}</strong>
                    <span className="user-email">{tab.user.email}</span>
                  </div>
                )}
                <div className="tab-meta">
                  <small>Created: {new Date(tab.createdAt).toLocaleTimeString()}</small>
                  <small>Last Active: {new Date(tab.lastActive).toLocaleTimeString()}</small>
                </div>
              </div>
              
              {tab.id !== currentTabId && tab.role && (
                <div className="tab-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      if (onTabSelect) {
                        onTabSelect(tab.id, tab.role);
                      }
                    }}
                  >
                    Switch to Tab
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Role Management */}
      {currentAuth.role && (
        <div className="role-management">
          <h3>Role Management</h3>
          <div className="role-switcher">
            <p>Switch to a different role:</p>
            <div className="role-buttons">
              {['user', 'driver', 'admin'].map((role) => (
                <button
                  key={role}
                  className={`role-button ${currentAuth.role === role ? 'active' : ''} ${!isRoleAvailable(role) && currentAuth.role !== role ? 'unavailable' : ''}`}
                  onClick={() => handleRoleSwitch(role)}
                  disabled={!isRoleAvailable(role) && currentAuth.role !== role}
                >
                  {getRoleIcon(role)} {role.toUpperCase()}
                  {!isRoleAvailable(role) && currentAuth.role !== role && (
                    <span className="unavailable-text">(In Use)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Roles */}
      <div className="available-roles">
        <h3>Available Roles</h3>
        <div className="roles-list">
          {availableRoles.length > 0 ? (
            availableRoles.map((role) => (
              <div key={role} className="role-item available">
                {getRoleIcon(role)} {role.toUpperCase()} - Available
              </div>
            ))
          ) : (
            <div className="role-item unavailable">
              All roles are currently in use
            </div>
          )}
        </div>
      </div>

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Login to New Role</h3>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email">Email:</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="login-password">Password:</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="login-role">Role:</label>
                <select
                  id="login-role"
                  value={loginData.role}
                  onChange={(e) => setLoginData({...loginData, role: e.target.value})}
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {getRoleIcon(role)} {role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowLoginForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

MultiTabDashboard.propTypes = {
  onTabSelect: PropTypes.func,
  onRoleSwitch: PropTypes.func
};
