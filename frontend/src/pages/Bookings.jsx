import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';
import config from '../config';
import '../styles/main.css';

export default function Bookings() {
  const { user } = useAuthContext();
  const [rides, setRides] = useState([]);

  useEffect(() => {
    async function fetchRides() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found for rides');
          return;
        }
        
        const res = await axios.get(`${config.API_BASE_URL}/rides/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRides(res.data.rides || []);
      } catch (err) {
        console.error('Error fetching rides:', err.response?.status, err.response?.data);
        if (err.response?.status === 400) {
          console.log('Bad request - likely authentication issue. Please log in first.');
        }
      }
    }
    fetchRides();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />
      
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '15px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Your Ride History
        </h1>
        <p style={{
          fontSize: '1.1rem',
          opacity: '0.9',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Track all your past and current rides in one place
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {rides.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚕</div>
            <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>No Rides Found</h3>
            <p style={{ color: '#718096', fontSize: '16px' }}>
              You haven't taken any rides yet. Start your journey by booking a ride!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {rides.map(ride => (
              <div
                key={ride._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
              >
                {/* Ride Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: 'white',
                      marginRight: '15px'
                    }}>
                      🚗
                    </div>
                    <div>
                      <h3 style={{
                        color: '#2d3748',
                        margin: '0 0 5px 0',
                        fontSize: '1.3rem',
                        fontWeight: '600'
                      }}>
                        Ride #{ride._id.slice(-6).toUpperCase()}
                      </h3>
                      <p style={{
                        color: '#718096',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {new Date(ride.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: ride.status === 'completed' ? '#38a169' : 
                                   ride.status === 'active' ? '#667eea' : 
                                   ride.status === 'cancelled' ? '#e53e3e' : '#ed8936',
                    color: 'white'
                  }}>
                    {ride.status?.charAt(0).toUpperCase() + (ride.status?.slice(1) || 'Unknown')}
                  </div>
                </div>

                {/* Route Information */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  {/* Pickup */}
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f7fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ marginRight: '8px', fontSize: '16px' }}>📍</span>
                      <span style={{ color: '#4a5568', fontWeight: '600', fontSize: '14px' }}>
                        Pickup
                      </span>
                    </div>
                    <p style={{
                      color: '#2d3748',
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {ride.pickup_location?.address || 'Location not specified'}
                    </p>
                  </div>

                  {/* Drop-off */}
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f7fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ marginRight: '8px', fontSize: '16px' }}>🎯</span>
                      <span style={{ color: '#4a5568', fontWeight: '600', fontSize: '14px' }}>
                        Drop-off
                      </span>
                    </div>
                    <p style={{
                      color: '#2d3748',
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {ride.drop_location?.address || 'Location not specified'}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                {ride.fare && (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f0fff4',
                    borderRadius: '12px',
                    border: '1px solid #9ae6b4',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      color: '#22543d',
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      💰 Total Fare: ₹{ride.fare}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
