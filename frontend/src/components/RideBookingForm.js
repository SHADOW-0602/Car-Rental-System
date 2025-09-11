import React, { useState } from 'react';
import axios from 'axios';
import VehicleCard from './VehicleCard';
import MapPicker from './MapPicker';
import DriverCard from './DriverCard';
import config from '../config';
import '../styles/main.css';

export default function RideBookingForm({ user, onBooking }) {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [ride, setRide] = useState(null);
  const [vehicleType, setVehicleType] = useState('economy');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [fareEstimate, setFareEstimate] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDrivers, setShowDrivers] = useState(false);

  const calculateFare = async () => {
    if (!pickup || !drop) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${config.API_BASE_URL}/rides/calculate-fare`,
        { pickup_location: pickup, drop_location: drop, vehicle_type: vehicleType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFareEstimate(res.data);
    } catch (err) {
      console.error('Fare calculation failed:', err);
    }
  };

  React.useEffect(() => {
    calculateFare();
  }, [pickup, drop, vehicleType]);

  const findDrivers = async () => {
    if (!pickup || !drop) {
      alert('Please select both pickup and drop locations on the map.');
      return;
    }
    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${config.API_BASE_URL}/rides/nearby-drivers?latitude=${pickup.latitude}&longitude=${pickup.longitude}&vehicle_type=${vehicleType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDrivers(res.data.drivers || []);
      setShowDrivers(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.error || 'Failed to find drivers');
    }
  };

  const bookRide = async (driverId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${config.API_BASE_URL}/rides/request`,
        { 
          pickup_location: pickup, 
          drop_location: drop, 
          vehicle_type: vehicleType,
          payment_method: paymentMethod,
          preferred_driver_id: driverId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);
      
      if (res.data.hasActiveRide) {
        setRide(res.data.ride);
        alert(res.data.message);
      } else {
        setRide(res.data.ride);
        setShowDrivers(false);
        if (onBooking) onBooking(res.data);
      }
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.error || 'Booking failed');
    }
  };



  return (
    <div>
      <form className="booking-form">
        <h2 className="booking-title">
          Request Your Ride
        </h2>
        
                 {/* Location Pickers */}
         <div className="location-grid">
           {/* Pickup Location */}
           <div className="location-card">
             {/* Decorative Background */}
             <div style={{
               position: 'absolute',
               top: '-20px',
               right: '-20px',
               width: '80px',
               height: '80px',
               backgroundColor: 'rgba(14, 165, 233, 0.1)',
               borderRadius: '50%'
             }}></div>
             
             <div style={{
               display: 'flex',
               alignItems: 'center',
               marginBottom: '20px'
             }}>
               <div style={{
                 width: '50px',
                 height: '50px',
                 background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                 borderRadius: '50%',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 marginRight: '15px',
                 fontSize: '20px',
                 color: 'white',
                 boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)'
               }}>
                 📍
               </div>
               <h3 style={{
                 color: '#0c4a6e',
                 margin: 0,
                 fontSize: '1.4rem',
                 fontWeight: '700'
               }}>
                 Pickup Location
               </h3>
             </div>
             
             <MapPicker label="Select Pickup Location" onLocationSelect={setPickup} autoGetUserLocation={true} />
             
             {pickup && (
               <div style={{
                 marginTop: '20px',
                 padding: '16px',
                 backgroundColor: '#ecfdf5',
                 borderRadius: '12px',
                 border: '2px solid #10b981',
                 boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
               }}>
                 <div style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '10px'
                 }}>
                   <div style={{
                     width: '24px',
                     height: '24px',
                     backgroundColor: '#10b981',
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '12px',
                     color: 'white'
                   }}>
                     ✓
                   </div>
                   <p style={{
                     margin: 0,
                     color: '#065f46',
                     fontSize: '14px',
                     fontWeight: '600'
                   }}>
                     <strong>📍 Selected:</strong> {pickup.address}
                   </p>
                 </div>
               </div>
             )}
           </div>

           {/* Drop-off Location */}
           <div className="location-card dropoff">
             {/* Decorative Background */}
             <div style={{
               position: 'absolute',
               bottom: '-20px',
               left: '-20px',
               width: '80px',
               height: '80px',
               backgroundColor: 'rgba(245, 158, 11, 0.1)',
               borderRadius: '50%'
             }}></div>
             
             <div style={{
               display: 'flex',
               alignItems: 'center',
               marginBottom: '20px'
             }}>
               <div style={{
                 width: '50px',
                 height: '50px',
                 background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                 borderRadius: '50%',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 marginRight: '15px',
                 fontSize: '20px',
                 color: 'white',
                 boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
               }}>
                 🎯
               </div>
               <h3 style={{
                 color: '#92400e',
                 margin: 0,
                 fontSize: '1.4rem',
                 fontWeight: '700'
               }}>
                 Drop-off Location
               </h3>
             </div>
             
             <MapPicker label="Select Drop-off Location" onLocationSelect={setDrop} autoGetUserLocation={false} />
             
             {drop && (
               <div style={{
                 marginTop: '20px',
                 padding: '16px',
                 backgroundColor: '#fef3c7',
                 borderRadius: '12px',
                 border: '2px solid #f59e0b',
                 boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
               }}>
                 <div style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '10px'
                 }}>
                   <div style={{
                     width: '24px',
                     height: '24px',
                     backgroundColor: '#f59e0b',
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '12px',
                     color: 'white'
                   }}>
                     ✓
                   </div>
                   <p style={{
                     margin: 0,
                     color: '#92400e',
                     fontSize: '14px',
                     fontWeight: '600'
                   }}>
                     <strong>🎯 Selected:</strong> {drop.address}
                   </p>
                 </div>
               </div>
             )}
           </div>
         </div>

        {/* Vehicle Type Selection */}
        <div className="vehicle-section">
          <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.2rem' }}>🚗 Select Vehicle Type</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {[
              { value: 'economy', label: '🚗 Economy', desc: 'Affordable rides' },
              { value: 'sedan', label: '🚙 Sedan', desc: 'Comfortable rides' },
              { value: 'suv', label: '🚐 SUV', desc: 'Premium rides' }
            ].map(vehicle => (
              <button
                key={vehicle.value}
                type="button"
                onClick={() => setVehicleType(vehicle.value)}
                style={{
                  padding: '15px 20px',
                  border: vehicleType === vehicle.value ? '2px solid #667eea' : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: vehicleType === vehicle.value ? '#f0f4ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '120px'
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>{vehicle.label}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{vehicle.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="payment-section">
          <h3 style={{ margin: '0 0 20px 0', color: '#92400e', fontSize: '1.2rem' }}>💳 Select Payment Method</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {[
              { value: 'cash', label: '💵 Cash', desc: 'Pay with cash' },
              { value: 'razorpay', label: '💳 Razorpay', desc: 'UPI/Card/Wallet' },
              { value: 'stripe', label: '💳 Stripe', desc: 'International cards' },
              { value: 'paypal', label: '🅿️ PayPal', desc: 'PayPal account' }
            ].map(payment => (
              <button
                key={payment.value}
                type="button"
                onClick={() => setPaymentMethod(payment.value)}
                style={{
                  padding: '15px',
                  border: paymentMethod === payment.value ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: paymentMethod === payment.value ? '#fffbeb' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>{payment.label}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{payment.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Fare Estimate */}
        {fareEstimate && (
          <div className="fare-estimate">
            <h3 style={{ margin: '0 0 15px 0', color: '#065f46', fontSize: '1.2rem' }}>💰 Fare Estimate</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>₹{fareEstimate.estimatedFare}</div>
                <div style={{ fontSize: '12px', color: '#065f46' }}>Total Fare</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#059669' }}>{fareEstimate.distance} km</div>
                <div style={{ fontSize: '12px', color: '#065f46' }}>Distance</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#059669' }}>{fareEstimate.estimatedTime} min</div>
                <div style={{ fontSize: '12px', color: '#065f46' }}>Est. Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Find Drivers Button */}
        <button 
          type="button"
          onClick={findDrivers}
          disabled={loading}
          className="find-drivers-btn"
        >
          {loading ? 'Finding Drivers...' : '🚗 Find Available Drivers'}
        </button>
      </form>

      {/* Available Drivers List */}
      {showDrivers && drivers.length > 0 && (
        <div className="drivers-section">
          <div style={{
            textAlign: 'center',
            marginBottom: '25px'
          }}>
            <h3 style={{
              color: '#2d3748',
              margin: '0 0 10px 0',
              fontSize: '1.6rem',
              fontWeight: '700'
            }}>
              🚗 Choose Your Driver
            </h3>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '14px'
            }}>
              Select a driver and confirm your booking
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {drivers.map((driver, index) => (
              <DriverCard
                key={driver._id || index}
                driver={driver}
                fareEstimate={fareEstimate}
                vehicleType={vehicleType}
                isSelected={selectedDriver === driver._id}
                onSelect={setSelectedDriver}
                onBook={bookRide}
                loading={loading}
              />
            ))}
          </div>
          
          <div style={{
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <button
              onClick={() => setShowDrivers(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ← Back to Search
            </button>
          </div>
        </div>
      )}
      
      {/* No Drivers Found */}
      {showDrivers && drivers.length === 0 && (
        <div style={{
          marginTop: '30px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>😔</div>
          <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>No Drivers Available</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            No drivers found in your area. Please try again later.
          </p>
          <button
            onClick={() => setShowDrivers(false)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← Try Again
          </button>
        </div>
      )}

      {/* Waiting for Driver Acceptance */}
      {ride && ride.status === 'requested' && !showDrivers && (
        <div className="waiting-screen">
          <div className="waiting-icon">
            ⏳
          </div>
          
          <h3 style={{
            color: '#92400e',
            margin: '0 0 15px 0',
            fontSize: '1.8rem',
            fontWeight: '700'
          }}>
            Waiting for Driver Acceptance
          </h3>
          
          <p style={{
            color: '#2d3748',
            fontSize: '16px',
            marginBottom: '25px',
            lineHeight: '1.6'
          }}>
            Your ride request has been sent to nearby drivers.<br/>
            Please wait while we find a driver for you.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '25px'
          }}>
            <div style={{
              padding: '15px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              border: '1px solid #0ea5e9'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>📍</div>
              <div style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: '600' }}>Pickup</div>
              <div style={{ fontSize: '12px', color: '#2d3748' }}>{pickup?.address}</div>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              border: '1px solid #f59e0b'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>Destination</div>
              <div style={{ fontSize: '12px', color: '#2d3748' }}>{drop?.address}</div>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              border: '1px solid #10b981'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>💰</div>
              <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '600' }}>Estimated Fare</div>
              <div style={{ fontSize: '16px', color: '#059669', fontWeight: '700' }}>₹{fareEstimate?.estimatedFare}</div>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#f3e8ff',
              borderRadius: '12px',
              border: '1px solid #8b5cf6'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{paymentMethod === 'cash' ? '💵' : '💳'}</div>
              <div style={{ fontSize: '14px', color: '#6b21a8', fontWeight: '600' }}>Payment</div>
              <div style={{ fontSize: '12px', color: '#2d3748', textTransform: 'capitalize' }}>{paymentMethod}</div>
            </div>
          </div>
          
          <div style={{
            padding: '15px',
            backgroundColor: '#fffbeb',
            borderRadius: '10px',
            border: '1px solid #f59e0b',
            marginBottom: '20px'
          }}>
            <p style={{
              margin: 0,
              color: '#92400e',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              💡 Tip: Keep your phone nearby. We'll notify you once a driver accepts your request!
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={async () => {
                if (!window.confirm('Are you sure you want to cancel this ride?')) return;
                try {
                  const token = localStorage.getItem('token');
                  const response = await fetch(`http://localhost:5000/api/rides/${ride._id}/cancel`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  if (response.ok) {
                    setRide(null);
                    alert('Ride cancelled successfully!');
                  } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to cancel ride');
                  }
                } catch (error) {
                  console.error('Error cancelling ride:', error);
                  alert('Failed to cancel ride');
                }
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ❌ Cancel Ride Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}