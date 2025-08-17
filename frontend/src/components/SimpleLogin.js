import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config';
import CookieManager from '../utils/cookieManager';
import '../styles/main.css';

export default function SimpleLogin({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
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
      
      const res = await axios.post(`${config.API_BASE_URL}/users/login`, payload);
      
      // Handle admin secret key requirement
      if (res.data.requiresSecretKey) {
        setShowSecretKey(true);
        setError('');
        return;
      }

      // Store session using cookie manager
      CookieManager.setUserSession(res.data.token, res.data.user);
      
      console.log('✅ Login successful!');
      
      if (onLogin) {
        onLogin(res.data.user, res.data.token);
      }
      
      // Reload page to refresh auth context
      window.location.href = '/';
      
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
            {loading ? '🔄 Signing In...' : showSecretKey ? '🔑 Admin Login' : '🚀 Sign In'}
          </button>
        </form>
        
        {/* Social Login Options */}
        <div style={{
          margin: '25px 0',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            height: '1px',
            backgroundColor: 'var(--border-color)',
            margin: '20px 0'
          }}></div>
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '0 15px',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            Or continue with
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <button
            type="button"
            onClick={() => alert('Google login coming soon!')}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#4285f4';
              e.target.style.backgroundColor = '#f8faff';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = 'white';
            }}
          >
            <span style={{ fontSize: '18px' }}>🔴</span>
            Google
          </button>
          
          <button
            type="button"
            onClick={() => alert('Apple login coming soon!')}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#000';
              e.target.style.backgroundColor = '#f9f9f9';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = 'white';
            }}
          >
            <span style={{ fontSize: '18px' }}>🍎</span>
            Apple
          </button>
        </div>
        
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
