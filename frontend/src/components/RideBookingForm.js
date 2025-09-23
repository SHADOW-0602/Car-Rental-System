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
    { id: 'razorpay', name: 'Razorpay', icon: '💳' },
    { id: 'stripe', name: 'Stripe', icon: '🌍' },
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
    
    // Check if pickup and drop are different (compare coordinates and address)
    const sameCoordinates = Math.abs(pickup.latitude - drop.latitude) < 0.001 && 
                           Math.abs(pickup.longitude - drop.longitude) < 0.001;
    const sameAddress = pickup.address === drop.address;
    
    if (sameCoordinates || sameAddress) {
      alert('Pickup and drop locations cannot be the same. Please select different locations.');
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
    
    // Check if pickup and drop are different (compare coordinates and address)
    if (pickup && drop) {
      const sameCoordinates = Math.abs(pickup.latitude - drop.latitude) < 0.001 && 
                             Math.abs(pickup.longitude - drop.longitude) < 0.001;
      const sameAddress = pickup.address === drop.address;
      
      if (sameCoordinates || sameAddress) {
        alert('Pickup and drop locations cannot be the same. Please select different locations.');
        return;
      }
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
      
      // Request ride with payment processing for non-cash methods
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
      
      // For non-cash payments, initiate payment first
      if (paymentMethod !== 'cash') {
        await initiatePayment();
        return;
      }
      
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

  // Initiate payment for ride
  const initiatePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Create temporary ride first
      const rideRes = await axios.post(
        `${config.API_BASE_URL}/rides/request`,
        { 
          pickup_location: pickup, 
          drop_location: drop, 
          vehicle_type: vehicleType,
          payment_method: paymentMethod,
          surge_multiplier: surgeMultiplier,
          status: 'payment_pending'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const ride = rideRes.data.ride;
      
      // Initiate payment
      const paymentRes = await axios.post(
        `${config.API_BASE_URL}/payments/initiate`,
        {
          rideId: ride._id,
          paymentMethod,
          amount: fareEstimate.estimatedFare
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (paymentRes.data.success) {
        await processPayment(paymentRes.data, ride._id);
      } else {
        throw new Error(paymentRes.data.error);
      }
    } catch (err) {
      console.error('Payment initiation failed:', err);
      alert(err?.response?.data?.error || 'Payment failed');
      setCurrentStep(3);
    }
  };

  // Process payment based on gateway
  const processPayment = async (paymentData, rideId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (paymentMethod === 'razorpay') {
        const options = {
          key: paymentData.gateway_response.key_id,
          amount: paymentData.gateway_response.amount,
          currency: paymentData.gateway_response.currency,
          order_id: paymentData.gateway_response.order_id,
          name: 'Car Rental System',
          description: 'Ride Payment',
          handler: async (response) => {
            await verifyPayment(paymentData.payment_id, {
              gateway_payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            }, rideId);
          },
          modal: {
            ondismiss: () => {
              alert('Payment cancelled');
              setCurrentStep(3);
            }
          }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
        
      } else if (paymentMethod === 'stripe') {
        // Stripe Checkout redirect
        const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        
        const { error } = await stripe.redirectToCheckout({
          sessionId: paymentData.gateway_response.session_id
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
      } else if (paymentMethod === 'paypal') {
        // PayPal payment handling - open in popup
        const popup = window.open(
          paymentData.gateway_response.approval_url,
          'paypal-payment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        // Monitor popup for completion
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Check payment status
            setTimeout(() => {
              verifyPayment(paymentData.payment_id, {}, rideId);
            }, 1000);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Payment processing failed:', err);
      alert('Payment failed: ' + err.message);
      setCurrentStep(3);
    }
  };

  // Verify payment and complete ride booking
  const verifyPayment = async (paymentId, paymentDetails, rideId) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post(
        `${config.API_BASE_URL}/payments/verify/${paymentId}`,
        paymentDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        // Update ride status to requested
        await axios.put(
          `${config.API_BASE_URL}/rides/${rideId}/status`,
          { status: 'requested' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Get updated ride data
        const rideRes = await axios.get(
          `${config.API_BASE_URL}/rides/${rideId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setRide(rideRes.data.ride);
        setRideStatus('requested');
        setCurrentStep(5);
        
        if (onBooking) onBooking(rideRes.data);
        monitorRideStatus(rideId);
        
        alert('Payment successful! Looking for drivers...');
      } else {
        throw new Error(res.data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      alert('Payment verification failed: ' + err.message);
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
        console.log('Ride status update:', rideData.status, rideData);
        
        // Update ride data completely
        setRide(rideData);
        setRideStatus(rideData.status);
        
        if (rideData.status === 'accepted') {
          setEta(rideData.driver_info?.eta || rideData.eta);
          console.log('Driver accepted! Driver info:', rideData.driver_info);
        } else if (rideData.status === 'in_progress') {
          setEta(rideData.driver_info?.eta || rideData.eta);
        } else if (rideData.status === 'completed' || rideData.status === 'cancelled') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status monitoring failed:', err);
      }
    }, 3000); // Check every 3 seconds for faster updates
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
                  console.log('Current drop location:', drop);
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
                  console.log('Current pickup location:', pickup);
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
            <div style={{ marginBottom: '30px' }}>
              {/* Trip Route - Uber Style */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '15px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', marginBottom: '8px' }}></div>
                    <div style={{ width: '2px', height: '40px', backgroundColor: '#d1d5db', borderRadius: '1px' }}></div>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', marginTop: '8px' }}></div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>From</div>
                      <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                        {pickup?.address?.split(',').slice(0, 2).join(', ') || 'Pickup location'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                        {pickup?.address?.split(',').slice(2, 4).join(', ') || ''}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>To</div>
                      <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                        {drop?.address?.split(',').slice(0, 2).join(', ') || 'Drop location'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                        {drop?.address?.split(',').slice(2, 4).join(', ') || ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                    {parseFloat(fareEstimate.distance).toFixed(1)} km
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Distance</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                    {fareEstimate.estimatedTime || Math.ceil(parseFloat(fareEstimate.distance) * 3)} min
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Time</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px' }}>
                    {vehicleTypes.find(v => v.id === vehicleType)?.icon}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {vehicleTypes.find(v => v.id === vehicleType)?.name}
                  </div>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#111827' }}>
                  Price details
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '15px' }}>
                  <span style={{ color: '#6b7280' }}>Base fare</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>₹{fareEstimate.fareBreakdown?.baseFare || fareEstimate.baseFare || vehicleTypes.find(v => v.id === vehicleType)?.baseFare || 50}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '15px' }}>
                  <span style={{ color: '#6b7280' }}>Distance ({fareEstimate.distance} km)</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>₹{fareEstimate.fareBreakdown?.distanceFare || Math.round(parseFloat(fareEstimate.distance) * (vehicleTypes.find(v => v.id === vehicleType)?.baseRate || 15))}</span>
                </div>
                
                {fareEstimate.fareBreakdown?.timeFare && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '15px' }}>
                    <span style={{ color: '#6b7280' }}>Time ({fareEstimate.estimatedTime} min)</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>₹{fareEstimate.fareBreakdown.timeFare}</span>
                  </div>
                )}
                
                {surgeMultiplier > 1.0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '15px', color: '#f59e0b' }}>
                    <span>Surge (×{surgeMultiplier.toFixed(1)})</span>
                    <span>+₹{fareEstimate.fareBreakdown?.surgeAmount || Math.round((fareEstimate.estimatedFare * surgeMultiplier) - fareEstimate.estimatedFare)}</span>
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px 0 8px 0',
                  fontSize: '18px',
                  fontWeight: '700',
                  borderTop: '1px solid #f3f4f6',
                  marginTop: '10px'
                }}>
                  <span style={{ color: '#111827' }}>Total</span>
                  <span style={{ color: '#111827' }}>₹{fareEstimate.estimatedFare}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#111827' }}>
              Payment method
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  borderRadius: '8px',
                  border: paymentMethod === method.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  backgroundColor: paymentMethod === method.id ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setPaymentMethod(method.id)}
              >
                <span style={{ fontSize: '20px', marginRight: '12px' }}>{method.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{method.name}</span>
                  {method.id !== 'cash' && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Pay now to confirm booking</div>
                  )}
                </div>
                {paymentMethod === method.id && (
                  <span style={{ marginLeft: 'auto', color: '#3b82f6', fontSize: '18px' }}>✓</span>
                )}
              </div>
            ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => setCurrentStep(2)}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button 
              onClick={handleFareSubmit}
              disabled={!paymentMethod}
              style={{
                flex: 2,
                padding: '16px',
                backgroundColor: !paymentMethod ? '#9ca3af' : '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: !paymentMethod ? 'not-allowed' : 'pointer'
              }}
            >
              {paymentMethod === 'cash' ? 'Request' : 'Pay & Request'} {vehicleTypes.find(v => v.id === vehicleType)?.name}
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
              {rideStatus === 'searching' && <span className="status-icon">🔍</span>}
              {rideStatus === 'requested' && <span className="status-icon">⏳</span>}
              {rideStatus === 'accepted' && <span className="status-icon">✅</span>}
              {rideStatus === 'in_progress' && <span className="status-icon">🚗</span>}
              {rideStatus === 'completed' && <span className="status-icon">🎉</span>}
              {rideStatus === 'cancelled' && <span className="status-icon">❌</span>}
            </div>
            
            <div className="status-text">
              {rideStatus === 'searching' && 'Searching for available drivers...'}
              {rideStatus === 'requested' && 'Waiting for driver to accept...'}
              {rideStatus === 'accepted' && 'Driver accepted! They\'re on the way.'}
              {rideStatus === 'in_progress' && 'Trip in progress'}
              {rideStatus === 'completed' && 'Trip completed! Thank you for riding with us.'}
              {rideStatus === 'cancelled' && 'Ride cancelled'}
            </div>
          </div>

          {(ride.driver_id || ride.driver_info) && rideStatus !== 'searching' && (
            <div className="driver-info">
              <h3>Your Driver</h3>
              <div className="driver-card">
                <div className="driver-avatar">
                  {(ride.driver_info?.name || ride.driver_id?.name || 'Driver').charAt(0)}
                </div>
                <div className="driver-details">
                  <div className="driver-name">{ride.driver_info?.name || ride.driver_id?.name || 'Driver'}</div>
                  <div className="driver-rating">
                    ⭐ {ride.driver_info?.rating || ride.driver_id?.rating || '4.5'}
                  </div>
                  <div className="driver-vehicle">
                    {vehicleTypes.find(v => v.id === vehicleType)?.icon} {ride.driver_info?.vehicle_model || vehicleTypes.find(v => v.id === vehicleType)?.name}
                  </div>
                  {ride.driver_info?.vehicle_number && (
                    <div className="driver-plate">
                      🚗 {ride.driver_info.vehicle_number}
                    </div>
                  )}
                  {ride.driver_info?.distance_from_user && (
                    <div className="driver-distance">
                      📍 {ride.driver_info.distance_from_user} km away
                    </div>
                  )}
                </div>
                <div className="driver-actions">
                  <button className="btn-icon">📞</button>
                  <button className="btn-icon">💬</button>
                </div>
              </div>
            </div>
          )}

          {(eta || ride.driver_info?.eta) && rideStatus !== 'searching' && (
            <div className="eta-info">
              <div className="eta-time">{eta || ride.driver_info?.eta} minutes</div>
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