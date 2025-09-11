import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config';
import '../styles/main.css';

export default function SignupForm({ onSignup }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    driverInfo: {
      licenseNumber: '',
      vehicleType: '',
      experience: ''
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

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };
      
      if (formData.role === 'driver') {
        payload.driverInfo = formData.driverInfo;
      }
      
      const res = await axios.post(`${config.API_BASE_URL}/users/register`, payload);

      console.log('✅ Signup successful!');
      
      // Redirect to login page
      window.location.href = '/login';
      
    } catch (err) {
      console.error('❌ Signup failed:', err.response?.data);
      setError(err.response?.data?.error || 'Signup failed');
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
            ✨
          </div>
          <h2 className="form-title">
            Join UrbanFleet
          </h2>
          <p className="form-subtitle">
            Create your account and start your journey
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label">
              Full Name
            </label>
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

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>
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
          
          {/* Phone Field */}
          <div className="form-group">
            <label className="form-label">
              Phone Number
            </label>
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
          
          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">
              Password
            </label>
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

          {/* Confirm Password Field */}
          <div className="form-group">
            <label className="form-label">
              Confirm Password
            </label>
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
          
          {/* Role Field */}
          <div className="form-group">
            <label className="form-label">
              Account Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
            >
              <option value="user">🚗 User (Book Rides)</option>
              <option value="driver">🚕 Driver (Provide Rides)</option>
            </select>
          </div>
          
          {/* Driver-specific fields */}
          {formData.role === 'driver' && (
            <>
              <div className="form-group">
                <label className="form-label">
                  License Number
                </label>
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
                <label className="form-label">
                  Vehicle Type
                </label>
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
                <label className="form-label">
                  Driving Experience (Years)
                </label>
                <input
                  type="number"
                  name="driver.experience"
                  value={formData.driverInfo.experience}
                  onChange={handleChange}
                  placeholder="Years of driving experience"
                  min="1"
                  required
                  className="form-input"
                />
              </div>
            </>
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
            {loading ? '🔄 Creating Account...' : formData.role === 'driver' ? '🚕 Register as Driver' : '🚀 Create Account'}
          </button>
        </form>
        

        
        {/* Login Link */}
        <div className="form-link">
          <p style={{ margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
