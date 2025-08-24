import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

export default function TwoFactorAuth({ user, onUpdate }) {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const setup2FA = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to enable 2FA');
        return;
      }
      
      const res = await axios.post(`${config.API_BASE_URL}/users/2fa/setup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setSuccess('Scan the QR code with your authenticator app');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
      } else {
        setError(err.response?.data?.error || 'Failed to setup 2FA');
      }
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to verify 2FA');
        return;
      }
      
      await axios.post(`${config.API_BASE_URL}/users/2fa/verify`, {
        token: verificationCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('2FA enabled successfully!');
      setQrCode('');
      setVerificationCode('');
      if (onUpdate) onUpdate();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
      } else {
        setError(err.response?.data?.error || 'Invalid verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to disable 2FA');
        return;
      }
      
      await axios.post(`${config.API_BASE_URL}/users/2fa/disable`, {
        password: disablePassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('2FA disabled successfully');
      setDisablePassword('');
      if (onUpdate) onUpdate();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
      } else {
        setError(err.response?.data?.error || 'Failed to disable 2FA');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: '#2d3748', marginBottom: '20px' }}>
        🔐 Two-Factor Authentication
      </h3>
      
      {error && (
        <div style={{
          backgroundColor: '#fed7d7',
          color: '#c53030',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          backgroundColor: '#c6f6d5',
          color: '#22543d',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          {success}
        </div>
      )}

      {!user?.twoFactorEnabled ? (
        <div>
          <p style={{ color: '#718096', marginBottom: '20px' }}>
            Add an extra layer of security to your account with two-factor authentication.
          </p>
          
          {!qrCode ? (
            <button
              onClick={setup2FA}
              disabled={loading}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src={qrCode} alt="QR Code" style={{ maxWidth: '200px' }} />
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '10px' }}>
                  Secret: {secret}
                </p>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </div>
              
              <button
                onClick={verify2FA}
                disabled={loading || !verificationCode}
                style={{
                  backgroundColor: '#38a169',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p style={{ color: '#38a169', marginBottom: '20px' }}>
            ✅ Two-factor authentication is enabled
          </p>
          
          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Enter your password to disable 2FA"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
          </div>
          
          <button
            onClick={disable2FA}
            disabled={loading || !disablePassword}
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      )}
    </div>
  );
}