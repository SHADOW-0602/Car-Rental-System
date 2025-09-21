import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import config from '../config';

const MultiTabAuthContext = createContext();

export const useMultiTabAuth = () => {
  const context = useContext(MultiTabAuthContext);
  if (!context) {
    throw new Error('useMultiTabAuth must be used within a MultiTabAuthProvider');
  }
  return context;
};

export const MultiTabAuthProvider = ({ children }) => {
  const [activeTabs, setActiveTabs] = useState({});
  const [currentTabId, setCurrentTabId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate unique tab ID
  useEffect(() => {
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    setCurrentTabId(tabId);
    
    // Register this tab
    const registerTab = () => {
      const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
      tabs[tabId] = {
        id: tabId,
        role: null,
        user: null,
        token: null,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      localStorage.setItem('activeTabs', JSON.stringify(tabs));
      setActiveTabs(tabs);
    };

    registerTab();

    // Clean up on tab close
    const handleBeforeUnload = () => {
      const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
      delete tabs[tabId];
      localStorage.setItem('activeTabs', JSON.stringify(tabs));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'activeTabs') {
        const tabs = JSON.parse(e.newValue || '{}');
        setActiveTabs(tabs);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get current tab's auth data
  const getCurrentTabAuth = () => {
    return activeTabs[currentTabId] || {};
  };

  // Login with specific role
  const loginAsRole = async (email, password, role) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${config.API_BASE_URL}/auth/login`, {
        email,
        password,
        role
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Update current tab's auth data
        const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
        tabs[currentTabId] = {
          ...tabs[currentTabId],
          role,
          user,
          token,
          lastActive: new Date().toISOString()
        };
        localStorage.setItem('activeTabs', JSON.stringify(tabs));
        setActiveTabs(tabs);

        // Store token for API calls
        localStorage.setItem('token', token);
        
        return { success: true, user, role };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Switch role for current tab
  const switchRole = async (targetRole) => {
    try {
      const currentAuth = getCurrentTabAuth();
      if (!currentAuth.token) {
        throw new Error('No active session');
      }

      const response = await axios.post(
        `${config.API_BASE_URL}/auth/switch-role`,
        { targetRole },
        { headers: { Authorization: `Bearer ${currentAuth.token}` } }
      );

      if (response.data.success) {
        const { role, token } = response.data;
        
        // Update current tab's auth data
        const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
        tabs[currentTabId] = {
          ...tabs[currentTabId],
          role,
          token,
          lastActive: new Date().toISOString()
        };
        localStorage.setItem('activeTabs', JSON.stringify(tabs));
        setActiveTabs(tabs);

        // Update token for API calls
        localStorage.setItem('token', token);
        
        return { success: true, role };
      }
    } catch (error) {
      console.error('Role switch error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Role switch failed' 
      };
    }
  };

  // Logout current tab
  const logout = () => {
    const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
    tabs[currentTabId] = {
      ...tabs[currentTabId],
      role: null,
      user: null,
      token: null,
      lastActive: new Date().toISOString()
    };
    localStorage.setItem('activeTabs', JSON.stringify(tabs));
    setActiveTabs(tabs);
    
    // Clear token
    localStorage.removeItem('token');
  };

  // Get all active tabs
  const getAllTabs = () => {
    return Object.values(activeTabs);
  };

  // Get tabs by role
  const getTabsByRole = (role) => {
    return Object.values(activeTabs).filter(tab => tab.role === role);
  };

  // Check if role is available (not already in use)
  const isRoleAvailable = (role) => {
    const tabsWithRole = getTabsByRole(role);
    return tabsWithRole.length === 0;
  };

  // Get available roles
  const getAvailableRoles = () => {
    const allRoles = ['user', 'driver', 'admin'];
    return allRoles.filter(role => isRoleAvailable(role));
  };

  const value = useMemo(() => ({
    currentTabId,
    currentAuth: getCurrentTabAuth(),
    activeTabs,
    isLoading,
    loginAsRole,
    switchRole,
    logout,
    getAllTabs,
    getTabsByRole,
    isRoleAvailable,
    getAvailableRoles
  }), [currentTabId, activeTabs, isLoading]);

  return (
    <MultiTabAuthContext.Provider value={value}>
      {children}
    </MultiTabAuthContext.Provider>
  );
}

MultiTabAuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
