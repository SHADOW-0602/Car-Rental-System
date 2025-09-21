import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

import RatingSystem from '../components/RatingSystem';

import { useAuthContext } from '../context/AuthContext';

export default function TrackRide() {
  const { rideId } = useParams();
  const { user } = useAuthContext();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      if (!rideId || rideId === 'undefined') {
        console.error('Invalid rideId in TrackRide:', rideId);
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/rides/${rideId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRide(data.ride);
          
          // Show rating if ride is completed and user hasn't rated yet
          if (data.ride.status === 'completed' && data.ratingStatus?.canRate) {
            setShowRating(true);
          }
        } else {
          console.error('Failed to fetch ride:', response.status);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ride');
        setLoading(false);
      }
    };

    if (rideId) {
      fetchRide();
    }
  }, [rideId]);

  const handleRatingComplete = () => {
    setShowRating(false);
    // Optionally refresh ride data or show success message
  };

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
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748', textAlign: 'center' }}>
          🚗 Track Your Ride
        </h1>

        {/* Ride Details */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Ride Details</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <strong>Status:</strong> {ride.status}
            </div>
            <div>
              <strong>From:</strong> {ride.pickup_location?.address}
            </div>
            <div>
              <strong>To:</strong> {ride.drop_location?.address}
            </div>
            <div>
              <strong>Fare:</strong> ₹{ride.fare}
            </div>
            {ride.driver_id && (
              <div>
                <strong>Driver:</strong> {ride.driver_id.name}
              </div>
            )}
          </div>
        </div>
        
        {/* Rating System */}
        {showRating && (
          <div style={{ marginTop: '30px' }}>
            <RatingSystem 
              rideId={rideId} 
              userRole={user?.role} 
              onRatingComplete={handleRatingComplete}
            />
          </div>
        )}

      </div>
    </div>
  );
}