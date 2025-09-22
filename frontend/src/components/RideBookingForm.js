import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapPicker from './MapPicker';
import config from '../config';
import '../styles/main.css';

export default function RideBookingForm({ user, onBooking }) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Location, 2: Vehicle, 3: Fare, 4: Matching, 5: Confirmed
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [ride, setRide] = useState(null);
  const [vehicleType, setVehicleType] = useState('economy');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [fareEstimate, setFareEstimate] = useState(null);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [matchingDrivers, setMatchingDrivers] = useState([]);
  const [rideStatus, setRideStatus] = useState('requested');
  const [eta, setEta] = useState(null);

  // Vehicle types with detailed information (matching backend rates)
  const vehicleTypes = [
    {
      id: 'economy',
      name: 'Economy',
      icon: '🚗',
      description: 'Affordable rides for everyday trips',
      baseFare: 50,
      baseRate: 15,
      perMin: 2,
      capacity: 4,
      features: ['Air conditioning', 'Standard comfort']
    },
    {
      id: 'sedan',
      name: 'Sedan',
      icon: '🚙',
      description: 'Comfortable rides with extra space',
      baseFare: 70,
      baseRate: 20,
      perMin: 2.5,
      capacity: 4,
      features: ['Air conditioning', 'Extra legroom', 'Premium comfort']
    },
    {
      id: 'suv',
      name: 'SUV',
      icon: '🚐',
      description: 'Spacious rides for groups',
      baseFare: 90,
      baseRate: 25,
      perMin: 3,
      capacity: 6,
      features: ['Air conditioning', 'Extra space', 'Group friendly']
    }
  ];

  // Payment methods
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'razorpay', name: 'UPI/Card', icon: '💳' },
    { id: 'stripe', name: 'International Cards', icon: '🌍' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' }
  ];

  // Calculate fare with surge pricing
  const calculateFare = async () => {
    if (!pickup || !drop) {
      console.log('Cannot calculate fare - missing locations:', { pickup: !!pickup, drop: !!drop });
      return;
    }
    
    console.log('Calculating fare for:', {
      pickup: pickup.address,
      drop: drop.address,
      vehicleType
    });
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${config.API_BASE_URL}/rides/calculate-fare`,
        { 
          pickup_location: pickup, 
          drop_location: drop, 
          vehicle_type: vehicleType,
          include_surge: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = res.data;
      console.log('Fare calculation result:', data);
      setFareEstimate(data);
      setSurgeMultiplier(parseFloat(data.surgeMultiplier) || 1.0);
    } catch (err) {
      console.error('Fare calculation failed:', err);
      setFareEstimate(null);
    }
  };

  // Auto-calculate fare when locations or vehicle type changes
  useEffect(() => {
    if (pickup && drop) {
      calculateFare();
    }
  }, [pickup, drop, vehicleType]);

  // Step 1: Location Selection
  const handleLocationSubmit = () => {
    if (!pickup || !drop) {
      alert('Please select both pickup and drop locations.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2: Vehicle Selection
  const handleVehicleSubmit = () => {
    if (!vehicleType) {
      alert('Please select a vehicle type.');
      return;
    }
    setCurrentStep(3);
  };

  // Step 3: Fare Review and Payment
  const handleFareSubmit = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    setCurrentStep(4);
    await findAndMatchDrivers();
  };

  // Find and match drivers
  const findAndMatchDrivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // First, find nearby drivers
      const driversRes = await axios.get(
        `${config.API_BASE_URL}/rides/nearby-drivers?latitude=${pickup.latitude}&longitude=${pickup.longitude}&vehicle_type=${vehicleType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const availableDrivers = driversRes.data.drivers || [];
      setMatchingDrivers(availableDrivers);
      
      if (availableDrivers.length === 0) {
        alert('No drivers available in your area. Please try again later.');
        setCurrentStep(3);
        setLoading(false);
        return;
      }
      
      // Just request ride without preferred driver - let drivers accept
      await requestRide(null);
      
    } catch (err) {
      console.error('Driver matching failed:', err);
      alert('Failed to find drivers. Please try again.');
      setCurrentStep(3);
    }
    setLoading(false);
  };

  // Request ride
  const requestRide = async (driverId = null) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${config.API_BASE_URL}/rides/request`,
        { 
          pickup_location: pickup, 
          drop_location: drop, 
          vehicle_type: vehicleType,
          payment_method: paymentMethod,
          ...(driverId && { preferred_driver_id: driverId }),
          surge_multiplier: surgeMultiplier
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.hasActiveRide) {
        setRide(res.data.ride);
        setRideStatus('requested');
        setCurrentStep(5);
        alert(res.data.message);
      } else {
        setRide(res.data.ride);
        setRideStatus('requested');
        setCurrentStep(5);
        if (onBooking) onBooking(res.data);
        
        // Start monitoring ride status
        monitorRideStatus(res.data.ride._id);
      }
    } catch (err) {
      console.error('Ride request failed:', err);
      alert(err?.response?.data?.error || 'Failed to request ride');
      setCurrentStep(3);
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
        setRideStatus(rideData.status);
        
        if (rideData.status === 'accepted') {
          setEta(rideData.eta);
        } else if (rideData.status === 'in_progress') {
          setEta(rideData.eta);
        } else if (rideData.status === 'completed' || rideData.status === 'cancelled') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status monitoring failed:', err);
      }
    }, 5000); // Check every 5 seconds
  };

  // Cancel ride
  const cancelRide = async () => {
    if (!ride) return;
    
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${config.API_BASE_URL}/rides/${ride._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRide(null);
      setRideStatus('cancelled');
      setCurrentStep(1);
      alert('Ride cancelled successfully');
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel ride');
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setPickup(null);
    setDrop(null);
    setRide(null);
    setRideStatus('requested');
    setEta(null);
    setMatchingDrivers([]);
    setFareEstimate(null);
    setSurgeMultiplier(1.0);
  };

  return (
    <div className="ride-booking-container">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`progress-step ${currentStep >= step ? 'active' : ''}`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && 'Location'}
              {step === 2 && 'Vehicle'}
              {step === 3 && 'Fare'}
              {step === 4 && 'Matching'}
              {step === 5 && 'Ride'}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Location Selection */}
      {currentStep === 1 && (
        <div className="booking-step">
          <h2>📍 Where are you going?</h2>
          
          <div className="location-grid">
            <div className="location-card">
              <h3>Pickup Location</h3>
              <MapPicker 
                key="pickup-map" // Add unique key
                label="Select Pickup Location" 
                onLocationSelect={(location) => {
                  console.log('Pickup location selected:', location);
                  setPickup(location);
                }} 
                autoGetUserLocation={true}
                placeholder="Enter pickup address or use GPS"
              />
              {pickup && (
                <div className="location-confirmation">
                  <span>✓</span>
                  <span>{pickup.address}</span>
                </div>
              )}
            </div>

            <div className="location-card">
              <h3>Drop-off Location</h3>
              <MapPicker 
                key="dropoff-map" // Add unique key
                label="Select Drop-off Location" 
                onLocationSelect={(location) => {
                  console.log('Drop-off location selected:', location);
                  setDrop(location);
                }} 
                autoGetUserLocation={false}
                placeholder="Enter destination address"
              />
              {drop && (
                <div className="location-confirmation">
                  <span>✓</span>
                  <span>{drop.address}</span>
                </div>
              )}
            </div>
          </div>

          <button 
            className="btn-primary"
            onClick={handleLocationSubmit}
            disabled={!pickup || !drop}
          >
            Continue to Vehicle Selection
          </button>
        </div>
      )}

      {/* Step 2: Vehicle Selection */}
      {currentStep === 2 && (
        <div className="booking-step">
          <h2>🚗 Choose your ride</h2>
          
          <div className="vehicle-grid">
            {vehicleTypes.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`vehicle-card ${vehicleType === vehicle.id ? 'selected' : ''}`}
                onClick={() => setVehicleType(vehicle.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setVehicleType(vehicle.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="vehicle-icon">{vehicle.icon}</div>
                <div className="vehicle-info">
                  <h3>{vehicle.name}</h3>
                  <p>{vehicle.description}</p>
                  <div className="vehicle-features">
                    {vehicle.features.map((feature) => (
                      <span key={feature} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                  <div className="vehicle-capacity">
                    Up to {vehicle.capacity} passengers
                  </div>
                </div>
                <div className="vehicle-rate">
                  ₹{vehicle.baseFare} + ₹{vehicle.baseRate}/km
                </div>
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
              ← Back
            </button>
            <button className="btn-primary" onClick={handleVehicleSubmit}>
              Continue to Fare Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Fare Review and Payment */}
      {currentStep === 3 && (
        <div className="booking-step">
          <h2>💰 Review your trip</h2>
          
          {fareEstimate && (
            <div className="fare-breakdown">
              <div className="trip-details">
                <div className="trip-route">
                  <div className="route-point pickup">
                    <span className="point-icon">📍</span>
                    <span>{pickup.address}</span>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point dropoff">
                    <span className="point-icon">🎯</span>
                    <span>{drop.address}</span>
                  </div>
                </div>
                
                <div className="trip-stats">
                  <div className="stat">
                    <span className="stat-label">Distance</span>
                    <span className="stat-value">{parseFloat(fareEstimate.distance).toFixed(1)} km</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Est. Time</span>
                    <span className="stat-value">{fareEstimate.estimatedTime || Math.ceil(parseFloat(fareEstimate.distance) * 3)} min</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Vehicle</span>
                    <span className="stat-value">{vehicleTypes.find(v => v.id === vehicleType)?.name}</span>
                  </div>
                </div>
              </div>

              <div className="fare-details">
                <div className="fare-line">
                  <span>Base fare</span>
                  <span>₹{fareEstimate.fareBreakdown?.baseFare || fareEstimate.baseFare || vehicleTypes.find(v => v.id === vehicleType)?.baseFare || 50}</span>
                </div>
                <div className="fare-line">
                  <span>Distance ({fareEstimate.distance} km × ₹{vehicleTypes.find(v => v.id === vehicleType)?.baseRate})</span>
                  <span>₹{fareEstimate.fareBreakdown?.distanceFare || Math.round(parseFloat(fareEstimate.distance) * (vehicleTypes.find(v => v.id === vehicleType)?.baseRate || 15))}</span>
                </div>
                {fareEstimate.fareBreakdown?.timeFare && (
                  <div className="fare-line">
                    <span>Time ({fareEstimate.estimatedTime} min × ₹{vehicleTypes.find(v => v.id === vehicleType)?.baseRate === 15 ? 2 : vehicleTypes.find(v => v.id === vehicleType)?.baseRate === 20 ? 2.5 : 3})</span>
                    <span>₹{fareEstimate.fareBreakdown.timeFare}</span>
                  </div>
                )}
                {surgeMultiplier > 1.0 && (
                  <div className="fare-line surge">
                    <span>Surge pricing (×{surgeMultiplier.toFixed(1)})</span>
                    <span>+₹{fareEstimate.fareBreakdown?.surgeAmount || Math.round((fareEstimate.estimatedFare * surgeMultiplier) - fareEstimate.estimatedFare)}</span>
                  </div>
                )}
                <div className="fare-line total">
                  <span>Total</span>
                  <span>₹{fareEstimate.estimatedFare}</span>
                </div>
              </div>
            </div>
          )}

          <div className="payment-section">
            <h3>💳 Payment Method</h3>
            <div className="payment-methods">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`payment-method ${paymentMethod === method.id ? 'selected' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPaymentMethod(method.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                  <span className="payment-icon">{method.icon}</span>
                  <span className="payment-name">{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
              ← Back
            </button>
            <button 
              className="btn-primary"
              onClick={handleFareSubmit}
              disabled={!paymentMethod}
            >
              Request Ride →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Driver Matching */}
      {currentStep === 4 && (
        <div className="booking-step">
          <h2>🔍 Finding your driver...</h2>
          
          <div className="matching-animation">
            <div className="loading-spinner"></div>
            <p>Searching for the best driver in your area</p>
            {matchingDrivers.length > 0 && (
              <p>Found {matchingDrivers.length} available drivers</p>
            )}
          </div>

          {loading && (
            <div className="matching-steps">
              <div className="matching-step">
                <span className="step-icon">🔍</span>
                <span>Searching nearby drivers...</span>
              </div>
              <div className="matching-step">
                <span className="step-icon">⚡</span>
                <span>Matching with best driver...</span>
              </div>
              <div className="matching-step">
                <span className="step-icon">📱</span>
                <span>Sending ride request...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Ride Confirmed and Tracking */}
      {currentStep === 5 && ride && (
        <div className="booking-step">
          <h2>🚗 Your ride is on the way!</h2>
          
          <div className="ride-status">
            <div className="status-indicator">
              {rideStatus === 'requested' && <span className="status-icon">⏳</span>}
              {rideStatus === 'accepted' && <span className="status-icon">✅</span>}
              {rideStatus === 'in_progress' && <span className="status-icon">🚗</span>}
              {rideStatus === 'completed' && <span className="status-icon">🎉</span>}
              {rideStatus === 'cancelled' && <span className="status-icon">❌</span>}
            </div>
            
            <div className="status-text">
              {rideStatus === 'requested' && 'Waiting for driver to accept...'}
              {rideStatus === 'accepted' && 'Driver accepted! They\'re on the way.'}
              {rideStatus === 'in_progress' && 'Trip in progress'}
              {rideStatus === 'completed' && 'Trip completed! Thank you for riding with us.'}
              {rideStatus === 'cancelled' && 'Ride cancelled'}
            </div>
          </div>

          {ride.driver_id && (
            <div className="driver-info">
              <h3>Your Driver</h3>
              <div className="driver-card">
                <div className="driver-avatar">
                  {ride.driver_id.name?.charAt(0) || 'D'}
                </div>
                <div className="driver-details">
                  <div className="driver-name">{ride.driver_id.name || 'Driver'}</div>
                  <div className="driver-rating">
                    ⭐ {ride.driver_id.rating || '4.5'}
                  </div>
                  <div className="driver-vehicle">
                    {vehicleTypes.find(v => v.id === vehicleType)?.icon} {vehicleTypes.find(v => v.id === vehicleType)?.name}
                  </div>
                </div>
                <div className="driver-actions">
                  <button className="btn-icon">📞</button>
                  <button className="btn-icon">💬</button>
                </div>
              </div>
            </div>
          )}

          {eta && (
            <div className="eta-info">
              <div className="eta-time">{eta} minutes</div>
              <div className="eta-label">Estimated arrival</div>
            </div>
          )}

          <div className="ride-actions">
            <button className="btn-secondary" onClick={cancelRide}>
              Cancel Ride
            </button>
            <button className="btn-primary" onClick={() => window.location.href = `/track-ride/${ride._id}`}>
              Track Ride
            </button>
          </div>
        </div>
      )}
    </div>
  );
}