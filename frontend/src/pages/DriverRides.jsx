import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function DriverRides() {
  const { user } = useAuthContext();
  const [rides, setRides] = useState([]);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch driver's rides and ride requests
        const [ridesRes, requestsRes] = await Promise.all([
          fetch('/api/rides/driver', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/rides/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        const ridesData = await ridesRes.json();
        const requestsData = await requestsRes.json();
        
        const allRides = [];
        
        // Add driver's accepted/in-progress/completed rides
        if (ridesData.success) {
          ridesData.rides.forEach(ride => {
            allRides.push({
              id: ride._id,
              passenger: ride.user_id?.name || 'Unknown',
              from: ride.pickup_location?.address || 'Unknown location',
              to: ride.drop_location?.address || 'Unknown location',
              distance: `${ride.distance?.toFixed(1) || 0} km`,
              fare: ride.fare || 0,
              status: ride.status,
              requestTime: new Date(ride.createdAt).toLocaleString()
            });
          });
        }
        
        // Add available ride requests
        if (requestsData.success) {
          requestsData.requests.forEach(request => {
            allRides.push({
              id: request._id,
              passenger: request.user_id?.name || 'Unknown',
              from: request.pickup_location?.address || 'Unknown location',
              to: request.drop_location?.address || 'Unknown location',
              distance: `${request.distance?.toFixed(1) || 0} km`,
              fare: request.fare || 0,
              status: 'available',
              requestTime: new Date(request.createdAt).toLocaleString()
            });
          });
        }
        
        setRides(allRides);
      } catch (error) {
        console.error('Error fetching rides:', error);
      }
    };
    
    if (user?.role === 'driver') {
      fetchRides();
      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(fetchRides, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleAcceptRide = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/rides/${rideId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setRides(rides.map(ride => 
          ride.id === rideId ? { ...ride, status: 'accepted' } : ride
        ));
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  };

  const handleStartTrip = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/rides/${rideId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ driverLocation: { latitude: 0, longitude: 0 } })
      });
      
      if (response.ok) {
        setRides(rides.map(ride => 
          ride.id === rideId ? { ...ride, status: 'in_progress' } : ride
        ));
      }
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  const handleCompleteRide = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (response.ok) {
        setRides(rides.map(ride => 
          ride.id === rideId ? { ...ride, status: 'completed' } : ride
        ));
      }
    } catch (error) {
      console.error('Error completing ride:', error);
    }
  };

  const filteredRides = rides.filter(ride => {
    if (activeTab === 'available') return ride.status === 'available';
    if (activeTab === 'active') return ['accepted', 'in_progress'].includes(ride.status);
    if (activeTab === 'completed') return ride.status === 'completed';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
          🚗 My Rides
        </h1>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          {[
            { id: 'available', label: '🔍 Available', count: rides.filter(r => r.status === 'available').length },
            { id: 'active', label: '🚗 Active', count: rides.filter(r => ['accepted', 'in_progress'].includes(r.status)).length },
            { id: 'completed', label: '✅ Completed', count: rides.filter(r => r.status === 'completed').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '25px',
                backgroundColor: activeTab === tab.id ? '#667eea' : 'white',
                color: activeTab === tab.id ? 'white' : '#64748b',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Rides List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredRides.map((ride) => (
            <div key={ride.id} style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '2px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#667eea',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700'
                    }}>
                      {ride.passenger.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: '#2d3748' }}>{ride.passenger}</h3>
                      <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>{ride.requestTime}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ color: '#48bb78', fontSize: '18px' }}>📍</span>
                      <span style={{ color: '#2d3748', fontWeight: '600' }}>From: {ride.from}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#ef4444', fontSize: '18px' }}>🎯</span>
                      <span style={{ color: '#2d3748', fontWeight: '600' }}>To: {ride.to}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>📏</span>
                      <span style={{ color: '#718096' }}>{ride.distance}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>💰</span>
                      <span style={{ color: '#48bb78', fontWeight: '700', fontSize: '18px' }}>₹{ride.fare}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'end' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: 
                      ride.status === 'available' ? '#dbeafe' :
                      ride.status === 'accepted' ? '#fef3c7' :
                      ride.status === 'in_progress' ? '#fed7d7' :
                      '#dcfce7',
                    color:
                      ride.status === 'available' ? '#2563eb' :
                      ride.status === 'accepted' ? '#d97706' :
                      ride.status === 'in_progress' ? '#dc2626' :
                      '#16a34a'
                  }}>
                    {ride.status.replace('_', ' ').toUpperCase()}
                  </span>

                  {ride.status === 'available' && (
                    <button
                      onClick={() => handleAcceptRide(ride.id)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Accept Ride
                    </button>
                  )}

                  {ride.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteRide(ride.id)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Complete Ride
                    </button>
                  )}

                  {ride.status === 'accepted' && (
                    <button
                      onClick={() => handleStartTrip(ride.id)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#ed8936',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Start Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRides.length === 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '50px',
              borderRadius: '15px',
              textAlign: 'center',
              color: '#718096'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚗</div>
              <h3>No rides found</h3>
              <p>
                {activeTab === 'available' && 'No ride requests available at the moment.'}
                {activeTab === 'active' && 'You have no active rides.'}
                {activeTab === 'completed' && 'No completed rides yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}