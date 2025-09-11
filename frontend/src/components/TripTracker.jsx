import React, { useState, useEffect } from 'react';
import PaymentGateway from './PaymentGateway';
import SimpleMap from './SimpleMap';
import io from 'socket.io-client';

export default function TripTracker({ rideId, userRole }) {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [socket, setSocket] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    if (!rideId) return;

    const fetchTripStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/rides/${rideId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTripData(data);
          setLastUpdated(new Date());
          
          // Show payment gateway when ride is completed for users
          if (data.ride?.status === 'completed' && userRole === 'user' && data.ride?.payment_status === 'pending') {
            setShowPaymentGateway(true);
          }
        } else {
          console.error('Failed to fetch trip status:', response.status, response.statusText);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trip status:', error);
        setLoading(false);
      }
    };

    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    // Listen for ride updates
    const userId = JSON.parse(localStorage.getItem('user'))?.id;
    if (userId) {
      newSocket.on(`user_notification_${userId}`, (notification) => {
        if (notification.rideId === rideId) {
          if (notification.type === 'ride_accepted') {
            setTripData(prev => ({
              ...prev,
              ride: { ...prev?.ride, status: 'accepted', driver_id: notification.driver }
            }));
          } else if (notification.type === 'ride_completed') {
            setTripData(prev => ({
              ...prev,
              ride: { ...prev?.ride, status: 'completed' }
            }));
            setShowPaymentGateway(true);
          } else if (notification.type === 'driver_location_update') {
            setDriverLocation(notification.location);
            setEta(notification.eta);
          }
        }
      });
      
      // Listen for driver location updates (for users)
      if (userRole === 'user') {
        newSocket.on(`ride_tracking_${rideId}`, (trackingData) => {
          setDriverLocation(trackingData.currentLocation);
          setEta(trackingData.eta);
          setLastUpdated(new Date());
        });
      }
    }

    fetchTripStatus();
    // Reduced polling frequency since we have real-time updates
    const interval = setInterval(fetchTripStatus, 30000);
    
    return () => {
      clearInterval(interval);
      newSocket.disconnect();
    };
  }, [rideId, userRole]);

  const handleStartTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          driverLocation: {
            latitude: 0, // This would be actual GPS location
            longitude: 0
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTripData(prev => ({ ...prev, ride: data.ride }));
        alert('Trip started successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start trip');
      }
    } catch (error) {
      console.error('Error starting trip:', error);
      alert('Failed to start trip');
    }
  };

  const handleCompleteRide = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTripData(prev => ({ ...prev, ride: data.ride }));
        alert('Ride completed successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to complete ride');
      }
    } catch (error) {
      console.error('Error completing ride:', error);
      alert('Failed to complete ride');
    }
  };

  const handleCancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setTripData(prev => ({ ...prev, ride: { ...prev.ride, status: 'cancelled' } }));
        alert('Ride cancelled successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to cancel ride');
      }
    } catch (error) {
      console.error('Error cancelling ride:', error);
      alert('Failed to cancel ride');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
        <p>Loading trip status...</p>
      </div>
    );
  }

  if (!tripData?.ride) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
        <p>Trip not found</p>
      </div>
    );
  }

  const { ride, driverLocation: tripDriverLocation } = tripData;

  return (
    <div className="trip-tracker">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          backgroundColor: ride.status === 'completed' ? '#48bb78' : 
                          ride.status === 'in_progress' ? '#ed8936' : '#667eea',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          marginRight: '15px'
        }}>
          {ride.status === 'completed' ? '✅' : 
           ride.status === 'in_progress' ? '🚗' : '📍'}
        </div>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>
            Trip #{ride._id.slice(-6).toUpperCase()}
          </h3>
          <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>
            Status: {ride.status.replace('_', ' ').toUpperCase()}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ color: '#48bb78', fontSize: '18px' }}>📍</span>
          <span style={{ color: '#2d3748', fontWeight: '600' }}>
            From: {ride.pickup_location?.address || 'Unknown'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#ef4444', fontSize: '18px' }}>🎯</span>
          <span style={{ color: '#2d3748', fontWeight: '600' }}>
            To: {ride.drop_location?.address || 'Unknown'}
          </span>
        </div>
      </div>

      {userRole === 'user' && ride.driver_id && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f0f9ff',
          borderRadius: '10px',
          marginBottom: '15px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>Driver Information</h4>
          <p style={{ margin: '0 0 5px 0', color: '#2d3748' }}>
            Name: {ride.driver_id.name}
          </p>
          <p style={{ margin: 0, color: '#2d3748' }}>
            Phone: {ride.driver_id.phone}
          </p>
        </div>
      )}

      {userRole === 'driver' && ride.user_id && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f0fff4',
          borderRadius: '10px',
          marginBottom: '15px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#22543d' }}>Passenger Information</h4>
          <p style={{ margin: '0 0 5px 0', color: '#2d3748' }}>
            Name: {ride.user_id.name}
          </p>
          <p style={{ margin: 0, color: '#2d3748' }}>
            Phone: {ride.user_id.phone}
          </p>
        </div>
      )}

      {/* Live tracking for both users and drivers */}
      {(driverLocation || tripDriverLocation) && (ride.status === 'accepted' || ride.status === 'in_progress') && (
        <div className="live-tracking-card">
          <div className="tracking-header">
            <div className="tracking-icon">🚗</div>
            <div>
              <h4 className="tracking-title">
                {userRole === 'user' ? 'Driver Location' : 'Your Location'}
              </h4>
              <p className="tracking-subtitle">
                {ride.status === 'accepted' ? 'Driver is on the way to pickup' : 'En route to destination'}
              </p>
            </div>
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span className="live-text">LIVE</span>
            </div>
          </div>
          
          <div className="location-info">
            <div className="location-item">
              <span className="location-icon">📍</span>
              <span className="location-text">
                {(driverLocation || tripDriverLocation)?.address || 'Updating location...'}
              </span>
            </div>
            
            {eta && (
              <div className="eta-info">
                <span className="eta-icon">⏱️</span>
                <span className="eta-text">ETA: {eta} min</span>
              </div>
            )}
          </div>
          
          {tripData?.tracking && (
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${tripData.tracking.progress || 0}%` }}
                ></div>
              </div>
              <div className="progress-info">
                <span>Progress: {tripData.tracking.progress || 0}%</span>
                <span>Distance: {ride.distance?.toFixed(1) || 0} km</span>
              </div>
            </div>
          )}
          
          <p className="last-updated">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
          </p>
          
          {/* Simple Map for visual tracking */}
          <SimpleMap 
            driverLocation={driverLocation || tripDriverLocation}
            pickupLocation={ride.pickup_location}
            dropLocation={ride.drop_location}
            rideStatus={ride.status}
          />
        </div>
      )}
      
      {/* Status messages for users */}
      {userRole === 'user' && ride.status !== 'cancelled' && (
        <div className={`status-message ${
          ride.status === 'requested' ? 'requested' :
          ride.status === 'accepted' ? 'accepted' :
          ride.status === 'in_progress' ? 'in-progress' :
          ride.status === 'completed' ? 'completed' : ''
        }`}>
          {ride.status === 'requested' && (
            <div>
              <div className="status-icon">⏳</div>
              <h4 className="status-title requested">Waiting for Driver</h4>
              <p className="status-description">
                Your ride request has been sent to nearby drivers. Please wait for acceptance.
              </p>
              <button onClick={handleCancelRide} className="cancel-trip-btn">
                ❌ Cancel Ride
              </button>
            </div>
          )}
          {ride.status === 'accepted' && (
            <div>
              <div className="status-icon">✅</div>
              <h4 className="status-title accepted">Driver On The Way</h4>
              <p className="status-description">
                {ride.driver_id?.name || 'Your driver'} is heading to your pickup location.
                {eta && ` Estimated arrival: ${eta} minutes.`}
              </p>
              <div className="driver-actions">
                <button className="btn btn-primary" onClick={() => window.open(`tel:${ride.driver_id?.phone}`)}>📞 Call Driver</button>
                <button onClick={handleCancelRide} className="cancel-trip-btn">
                  ❌ Cancel Ride
                </button>
              </div>
            </div>
          )}
          {ride.status === 'in_progress' && (
            <div>
              <div className="status-icon">🚗</div>
              <h4 className="status-title in-progress">On Your Way</h4>
              <p className="status-description">
                You're on your way to {ride.drop_location?.address || 'your destination'}.
                {eta && ` Estimated arrival: ${eta} minutes.`}
              </p>
              <div className="trip-actions">
                <button className="btn btn-primary" onClick={() => window.open(`tel:${ride.driver_id?.phone}`)}>📞 Call Driver</button>
              </div>
            </div>
          )}
          {ride.status === 'completed' && (
            <div>
              <div className="status-icon">🎉</div>
              <h4 className="status-title completed">Trip Completed</h4>
              <p className="status-description">
                Your trip has been completed successfully!
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Driver action buttons */}
      {userRole === 'driver' && ride.status === 'accepted' && (
        <div className="action-section driver">
          <button onClick={handleStartTrip} className="btn btn-success">
            🚀 Start Trip
          </button>
        </div>
      )}
      
      {/* Complete ride button for drivers */}
      {userRole === 'driver' && ride.status === 'in_progress' && (
        <div className="action-section driver">
          <button onClick={handleCompleteRide} className="complete-ride-btn">
            ✅ Complete Ride
          </button>
        </div>
      )}
      
      {/* Cancel ride button for drivers */}
      {userRole === 'driver' && (ride.status === 'accepted' || ride.status === 'in_progress') && (
        <div className="action-section cancel">
          <button onClick={handleCancelRide} className="cancel-trip-btn">
            ❌ Cancel Ride
          </button>
        </div>
      )}
      
      {/* Payment Gateway */}
      {showPaymentGateway && userRole === 'user' && ride.status === 'completed' && (
        <PaymentGateway
          ride={ride}
          onPaymentComplete={() => setShowPaymentGateway(false)}
        />
      )}
      
      {/* Show cancelled status */}
      {ride.status === 'cancelled' && (
        <div className="status-message cancelled">
          <div>
            <div className="status-icon">❌</div>
            <h4 className="status-title cancelled">Ride Cancelled</h4>
            <p className="status-description">
              This ride has been cancelled. You can book a new ride anytime.
            </p>
          </div>
        </div>
      )}

      <div className="trip-summary">
        <div className="summary-item">
          <div className="summary-label">Fare</div>
          <p className={`summary-value ${ride.status === 'cancelled' ? '' : 'fare'}`}>
            {ride.status === 'cancelled' ? 'N/A' : `₹${ride.fare || 0}`}
          </p>
        </div>
        <div className="summary-item">
          <div className="summary-label">Distance</div>
          <p className="summary-value distance">
            {ride.distance?.toFixed(1) || 0} km
          </p>
        </div>
      </div>
    </div>
  );
}