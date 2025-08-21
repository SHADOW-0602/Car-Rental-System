import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import CookieManager from '../utils/cookieManager';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize from session on mount
  useEffect(() => {
    const session = CookieManager.getUserSession();
    console.log('🔍 Session check on mount:', { hasToken: !!session.token, hasUser: !!session.user });
    if (session.token && session.user) {
      setToken(session.token);
      setUser(session.user);
      console.log('✅ Session restored:', session.user.role);
    } else {
      console.log('❌ No valid session found');
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 Logging out and clearing session');
    CookieManager.clearUserSession();
    setToken(null);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Profile fetch error', err);
      // Don't call logout here to avoid circular dependency
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load profile when token changes (but not on initial mount)
  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  const login = async (email, password, secretKey) => {
    try {
      setLoading(true);
      const payload = { email, password };
      if (secretKey) payload.secretKey = secretKey;
      
      const res = await axios.post(`${config.API_BASE_URL}/users/login`, payload);
      
      if (res.data.requiresSecretKey) {
        return { requiresSecretKey: true };
      }
      
      console.log('💾 Saving session:', res.data.user.role);
      CookieManager.setUserSession(res.data.token, res.data.user);
      setToken(res.data.token);
      setUser(res.data.user);
      
      // Verify session was saved
      const savedSession = CookieManager.getUserSession();
      console.log('✅ Session verification:', { saved: !!savedSession.token });
      
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error('Login failed', err);
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const updateAuthState = (token, user) => {
    setToken(token);
    setUser(user);
  };



  const register = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${config.API_BASE_URL}/users/register`, formData);
      return res.data;
    } catch (err) {
      console.error('Registration failed', err);
    } finally {
      setLoading(false);
    }
  };



  return { user, token, loading, login, register, logout, updateAuthState };
}