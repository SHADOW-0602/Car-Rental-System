import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import config from '../config';
import CookieManager from '../utils/cookieManager';
import '../styles/main.css';

export default function SimpleLogin({ onLogin }) {
  const navigate = useNavigate();
  const { updateAuthState } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { email, password };
      if (showSecretKey) {
        payload.secretKey = secretKey;
      }
      if (show2FA) {
        payload.twoFactorCode = twoFactorCode;
      }
      
      const res = await axios.post(`${config.API_BASE_URL}/users/login`, payload);
      
      // Handle admin secret key requirement
      if (res.data.requiresSecretKey) {
        setShowSecretKey(true);
        setError('');
        return;
      }
      
      // Handle 2FA requirement
      if (res.data.requires2FA) {
        setShow2FA(true);
        setError('');
        return;
      }

      // Store session using cookie manager
      CookieManager.setUserSession(res.data.token, res.data.user);
      
      // Update auth context immediately
      updateAuthState(res.data.token, res.data.user);
      
      console.log('✅ Login successful!');
      
      if (onLogin) {
        onLogin(res.data.user, res.data.token);
      }
      
      // Navigate based on user role
      if (res.data.user.role === 'admin') {
        navigate('/admin/portal');
      } else if (res.data.user.role === 'driver') {
        navigate('/driver/portal');
      } else {
        navigate('/user/portal');
      }
      
    } catch (err) {
      console.error('❌ Login failed:', err.response?.data);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card" style={{ maxWidth: '450px' }}>
        {/* Header */}
        <div className="form-header">
          <div className="form-icon">
            🚗
          </div>
          <h2 className="form-title">
            Welcome Back
          </h2>
          <p className="form-subtitle">
            Sign in to access your account
          </p>
        </div>


        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="form-input"
            />
          </div>
          
          {showSecretKey && (
            <div className="form-group">
              <label className="form-label" style={{ color: '#dc2626' }}>
                🔑 Admin Secret Key
              </label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter admin secret key"
                required
                className="form-input"
                style={{ borderColor: '#dc2626' }}
              />
              <p style={{ fontSize: '12px', color: '#dc2626', margin: '5px 0 0 0' }}>
                Admin credentials detected. Secret key required.
              </p>
            </div>
          )}
          
          {show2FA && (
            <div className="form-group">
              <label className="form-label" style={{ color: '#667eea' }}>
                🔐 Two-Factor Authentication Code
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                className="form-input"
                style={{ borderColor: '#667eea' }}
                maxLength="6"
              />
              <p style={{ fontSize: '12px', color: '#667eea', margin: '5px 0 0 0' }}>
                Enter the code from your authenticator app.
              </p>
            </div>
          )}
          
          {error && (
            <div className="form-error">
              ❌ {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="form-btn"
          >
            {loading ? '🔄 Signing In...' : showSecretKey ? '🔑 Admin Login' : show2FA ? '🔐 Verify 2FA' : '🚀 Sign In'}
          </button>
        </form>
        

        
        {/* Signup Link */}
        <div className="form-link">
          <p style={{ margin: '0 0 10px 0' }}>
            Don't have an account?{' '}
            <Link to="/signup">
              Sign up here
            </Link>
          </p>
          <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-muted)' }}>
            Want to drive and earn?{' '}
            <Link to="/driver/register" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
              🚕 Become a Driver
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
