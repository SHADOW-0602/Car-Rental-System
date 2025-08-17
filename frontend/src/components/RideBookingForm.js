import React, { useState } from 'react';
import axios from 'axios';
import VehicleCard from './VehicleCard';
import MapPicker from './MapPicker';
import config from '../config';
import '../styles/main.css';

export default function RideBookingForm({ user, onBooking }) {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [ride, setRide] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickup || !drop) {
      alert('Please select both pickup and drop locations on the map.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${config.API_BASE_URL}/rides/request`,
        { pickup_location: pickup, drop_location: drop },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);
      setDrivers(res.data.nearbyDrivers || []);
      setRide(res.data.ride);
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.error || 'Booking failed');
    }
  };

  const handleVehicleSelect = async (driver) => {
    if (!ride) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${config.API_BASE_URL}/rides/confirm`,
        { rideId: ride._id, driverId: driver.driverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onBooking) onBooking(res.data);
      alert(`Ride confirmed with ${driver.driverId}!`);
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to confirm ride');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#2d3748',
          marginBottom: '20px',
          fontSize: '1.8rem',
          fontWeight: '600'
        }}>
          Request Your Ride
        </h2>
        
                 {/* Location Pickers */}
         <div style={{
           display: 'grid',
           gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
           gap: '30px',
           marginBottom: '30px'
         }}>
           {/* Pickup Location */}
           <div style={{
             background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
             padding: '30px',
             borderRadius: '20px',
             border: '2px solid #0ea5e9',
             transition: 'all 0.3s ease',
             position: 'relative',
             overflow: 'hidden'
           }}
           onMouseEnter={(e) => {
             e.target.style.transform = 'translateY(-2px)';
             e.target.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.15)';
           }}
           onMouseLeave={(e) => {
             e.target.style.transform = 'translateY(0)';
             e.target.style.boxShadow = '0 10px 30px rgba(14, 165, 233, 0.1)';
           }}
           >
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
           <div style={{
             background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
             padding: '30px',
             borderRadius: '20px',
             border: '2px solid #f59e0b',
             transition: 'all 0.3s ease',
             position: 'relative',
             overflow: 'hidden'
           }}
           onMouseEnter={(e) => {
             e.target.style.transform = 'translateY(-2px)';
             e.target.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.15)';
           }}
           onMouseLeave={(e) => {
             e.target.style.transform = 'translateY(0)';
             e.target.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.1)';
           }}
           >
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

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '18px 30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
            alignSelf: 'center',
            minWidth: '200px'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '10px'
              }}></div>
              Searching for Drivers...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🚗 Find Available Ride
            </span>
          )}
        </button>
      </form>

      {/* Drivers Section */}
      {drivers.length > 0 && (
        <div style={{
          marginTop: '40px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              marginRight: '15px'
            }}>
              🚕
            </div>
            <h3 style={{
              color: '#2d3748',
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Available Drivers Near You
            </h3>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {drivers.map((driver, idx) => (
              <VehicleCard
                key={idx}
                vehicle={{
                  make: 'Available',
                  model: 'Driver Vehicle',
                  vehicle_type: 'economy',
                  fare_per_km: 10,
                  availability: true,
                  driver_id: { name: driver.driverId },
                }}
                onSelect={() => handleVehicleSelect(driver)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}