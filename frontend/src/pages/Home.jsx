import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RideBookingForm from '../components/RideBookingForm';
import VehicleCard from '../components/VehicleCard';
import Navbar from '../components/Navbar';
import '../styles/main.css';

export default function Home({ user }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />
      
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          marginBottom: '20px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Welcome to Car Rental System
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: '0.9',
          maxWidth: '600px',
          margin: '0 auto 30px'
        }}>
          Experience premium car rentals with the best vehicles and exceptional service
        </p>
        
        {!user && (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/signup" 
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🚗 Book Rides
            </Link>
            
            <Link 
              to="/driver/register" 
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.9)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🚕 Become a Driver
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Features Section */}
        {!user && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginBottom: '50px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white'
              }}>
                🚗
              </div>
              <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>Premium Vehicles</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>
                Choose from our fleet of luxury and economy vehicles
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#764ba2',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white'
              }}>
                ⚡
              </div>
              <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>Instant Booking</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>
                Book your ride in seconds with our streamlined process
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f093fb',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white'
              }}>
                🛡️
              </div>
              <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>Safe & Secure</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>
                Your safety is our priority with verified drivers
              </p>
            </div>
          </div>
        )}

        {/* Booking Form Section */}
        <div style={{
          background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
          borderRadius: '25px',
          padding: '50px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          border: '2px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            opacity: '0.1'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '50%',
            opacity: '0.1'
          }}></div>
          
          <div style={{
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white',
                boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)'
              }}>
                🚗
              </div>
              <h2 style={{
                color: '#2d3748',
                marginBottom: '15px',
                fontSize: '2.5rem',
                fontWeight: '700'
              }}>
                Book Your Ride
              </h2>
              <p style={{
                color: '#718096',
                fontSize: '1.1rem',
                maxWidth: '500px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Choose your pickup and drop-off locations to find available drivers near you
              </p>
            </div>
            
            <RideBookingForm
              user={user}
              onBooking={(ride, vehicle) => {
                console.log('Ride booked:', ride);
                if (vehicle) {
                  setSelectedVehicle(vehicle);
                }
              }}
            />
          </div>
        </div>

        {/* Selected Vehicle Section */}
        {selectedVehicle && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            marginBottom: '40px'
          }}>
            <h2 style={{
              textAlign: 'center',
              color: '#2d3748',
              marginBottom: '30px',
              fontSize: '2rem',
              fontWeight: '600'
            }}>
              Your Selected Vehicle
            </h2>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <VehicleCard vehicle={selectedVehicle} onSelect={() => {}} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}