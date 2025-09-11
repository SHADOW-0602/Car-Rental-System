import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TripTracker from '../components/TripTracker';
import { useAuthContext } from '../context/AuthContext';

export default function TrackRide() {
  const { rideId } = useParams();
  const { user } = useAuthContext();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/rides/${rideId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRide(data.ride);
        } else {
          console.error('Failed to fetch ride:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ride:', error);
        setLoading(false);
      }
    };

    if (rideId) {
      fetchRide();
    }
  }, [rideId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar user={user} />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
          <h2>Loading ride details...</h2>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar user={user} />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2>Ride not found</h2>
          <p>The ride you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
          🚗 Track Your Ride
        </h1>

        <TripTracker rideId={rideId} userRole={user?.role} />

        {ride.status === 'requested' && user?.role === 'user' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>⏳</div>
            <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>Waiting for Driver</h3>
            <p style={{ color: '#718096' }}>
              Your ride request has been sent to nearby drivers. Please wait for acceptance.
            </p>
          </div>
        )}
        
        {ride.status === 'accepted' && user?.role === 'user' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>✅</div>
            <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>Driver Accepted!</h3>
            <p style={{ color: '#718096' }}>
              Your ride has been accepted. The driver will arrive shortly.
            </p>
          </div>
        )}

        {ride.status === 'in_progress' && user?.role === 'user' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>🚗</div>
            <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>Trip in Progress</h3>
            <p style={{ color: '#718096' }}>
              Your trip is currently in progress. Sit back and enjoy the ride!
            </p>
          </div>
        )}

        {ride.status === 'completed' && user?.role === 'user' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>🎉</div>
            <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>Trip Completed!</h3>
            <p style={{ color: '#718096' }}>
              Your trip has been completed. Please proceed with payment if required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}