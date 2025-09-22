import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config';
import '../styles/main.css';

export default function DriverRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'driver',
    driverInfo: {
      licenseNumber: '',
      vehicleType: '',
      drivingExperience: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('driver.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        driverInfo: {
          ...formData.driverInfo,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.phone) {
      setError('Phone number is required for drivers');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        driverInfo: formData.driverInfo
      };
      
      const res = await axios.post(`${config.API_BASE_URL}/users/register`, payload);

      console.log('✅ Driver registration successful!');
      
      // Redirect to login page with success message
      navigate('/login', { state: { message: 'Driver registration successful! Please login to continue.' } });
      
    } catch (err) {
      console.error('❌ Driver registration failed:', err.response?.data);
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        {/* Header */}
        <div className="form-header">
          <div className="form-icon">
            🚕
          </div>
          <h2 className="form-title">
            Become a Driver
          </h2>
          <p className="form-subtitle">
            Join our driver network and start earning
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px', fontSize: '16px' }}>
              Personal Information
            </h3>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Driver Information */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px', fontSize: '16px' }}>
              Driver Information
            </h3>
            
            <div className="form-group">
              <label className="form-label">License Number</label>
              <input
                type="text"
                name="driver.licenseNumber"
                value={formData.driverInfo.licenseNumber}
                onChange={handleChange}
                placeholder="Enter your license number"
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select
                name="driver.vehicleType"
                value={formData.driverInfo.vehicleType}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select vehicle type</option>
                <option value="sedan">🚗 Sedan</option>
                <option value="suv">🚙 SUV</option>
                <option value="hatchback">🚘 Hatchback</option>
                <option value="luxury">🏎️ Luxury</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Driving Experience (Years)</label>
              <input
                type="number"
                name="driver.drivingExperience"
                value={formData.driverInfo.drivingExperience}
                onChange={handleChange}
                placeholder="Years of driving experience"
                min="1"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Security */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px', fontSize: '16px' }}>
              Security
            </h3>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="form-input"
              />
            </div>
          </div>
          
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
            {loading ? '🔄 Registering...' : '🚕 Register as Driver'}
          </button>
        </form>
        
        {/* Info Box */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px 0',
          fontSize: '14px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0ea5e9' }}>📋 Next Steps</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Complete document verification</li>
            <li>Vehicle inspection</li>
            <li>Background check</li>
            <li>Start earning!</li>
          </ul>
        </div>
        
        {/* Login Link */}
        <div className="form-link">
          <p style={{ margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login">
              Sign in here
            </Link>
          </p>
          <p style={{ margin: '10px 0 0 0' }}>
            Want to book rides instead?{' '}
            <Link to="/signup">
              Register as User
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}