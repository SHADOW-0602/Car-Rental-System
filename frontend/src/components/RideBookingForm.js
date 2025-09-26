import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapPicker from './MapPicker';
import TripPlanningInterface from './TripPlanningInterface';
import DriverMatchingInterface from './DriverMatchingInterface';
import RealTimeTripTracker from './RealTimeTripTracker';
import EnhancedRatingSystem from './EnhancedRatingSystem';
import config from '../config';
import '../styles/main.css';

export default function RideBookingForm({ user, onBooking }) {
  const [currentStep, setCurrentStep] = useState('planning'); // planning, matching, tracking, rating, completed
  const [userLocation, setUserLocation] = useState(null);
  const [ride, setRide] = useState(null);
  const [rideStatus, setRideStatus] = useState('searching');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user's current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location'
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location (e.g., city center)
          setUserLocation({
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'New Delhi, India'
          });
        }
      );
    }
  };

  // Handle ride request from trip planning interface
  const handleRideRequest = async (rideData) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_BASE_URL}/rides/request`,
        rideData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setRide(response.data.ride);
        setRideStatus(response.data.ride.status);
        setCurrentStep('matching');
        
        if (onBooking) {
          onBooking(response.data);
        }
        
        // Start monitoring ride status
        monitorRideStatus(response.data.ride._id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request ride');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle driver matching completion
  const handleMatchingComplete = (result) => {
    if (result.success) {
      setCurrentStep('tracking');
    } else {
      setCurrentStep('planning');
      setRide(null);
    }
  };

  // Handle trip completion
  const handleTripComplete = () => {
    setCurrentStep('rating');
  };

  // Handle rating completion
  const handleRatingComplete = (result) => {
    if (result.success || result.skipped) {
      setCurrentStep('completed');
      // Reset after a delay
      setTimeout(() => {
        resetBooking();
      }, 3000);
    }
  };

  // Reset booking to start over
  const resetBooking = () => {
    setCurrentStep('planning');
    setRide(null);
    setRideStatus('searching');
    setError('');
  };

  // Cancel current ride
  const handleCancelRide = async () => {
    if (!ride) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${config.API_BASE_URL}/rides/${ride._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      resetBooking();
    } catch (err) {
      setError('Failed to cancel ride');
    }
  };

  // Monitor ride status for real-time updates
  const monitorRideStatus = (rideId) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${config.API_BASE_URL}/rides/${rideId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const rideData = res.data.ride;
        setRide(rideData);
        setRideStatus(rideData.status);
        
        console.log('Ride status update:', rideData.status);
        
        // Update step based on ride status
        if (rideData.status === 'accepted' && currentStep === 'matching') {
          setCurrentStep('tracking');
          clearInterval(interval);
        } else if (rideData.status === 'completed' && currentStep === 'tracking') {
          setCurrentStep('rating');
          clearInterval(interval);
        } else if (rideData.status === 'cancelled') {
          clearInterval(interval);
          resetBooking();
        }
        
        // If still searching after 5 minutes, show timeout
        if (rideData.status === 'searching') {
          const searchTime = new Date() - new Date(rideData.createdAt);
          if (searchTime > 5 * 60 * 1000) { // 5 minutes
            clearInterval(interval);
            setError('No drivers available. Please try again later.');
            setTimeout(resetBooking, 3000);
          }
        }
      } catch (err) {
        console.error('Status monitoring failed:', err);
      }
    }, 2000); // Check every 2 seconds
    
    // Store interval ID to clear it later
    return interval;
  };

  // Show loading state while getting user location
  if (!userLocation) {
    return (
      <div className="ride-booking-container">
        <div className="loading-location">
          <div className="loading-spinner"></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-booking-container">
      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Trip Planning Interface */}
      {currentStep === 'planning' && (
        <TripPlanningInterface
          onRideRequest={handleRideRequest}
          userLocation={userLocation}
        />
      )}

      {/* Driver Matching Interface */}
      {currentStep === 'matching' && (
        <DriverMatchingInterface
          rideRequest={ride}
          onCancel={handleCancelRide}
        />
      )}

      {/* Real-time Trip Tracking */}
      {currentStep === 'tracking' && ride && (
        <RealTimeTripTracker
          ride={ride}
          userType="user"
          onRideComplete={handleTripComplete}
        />
      )}

      {/* Enhanced Rating System */}
      {currentStep === 'rating' && ride && (
        <EnhancedRatingSystem
          ride={ride}
          userType="user"
          onComplete={handleRatingComplete}
        />
      )}

      {/* Completion Screen */}
      {currentStep === 'completed' && (
        <div className="booking-step completion-screen">
          <div className="completion-animation">
            <div className="success-icon">🎉</div>
            <h2>Thank you for riding with us!</h2>
            <p>Your feedback helps us improve our service.</p>
          </div>
          
          <button 
            className="btn-primary"
            onClick={resetBooking}
          >
            Book Another Ride
          </button>
        </div>
      )}
    </div>
  );
}