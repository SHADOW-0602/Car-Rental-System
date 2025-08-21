import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function DriverEarnings() {
  const { user } = useAuthContext();
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    rides: []
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setEarnings({
      today: 850,
      thisWeek: 4200,
      thisMonth: 18500,
      total: 125000,
      rides: [
        { id: 1, date: '2024-01-15', from: 'Airport', to: 'Downtown', fare: 450, status: 'completed' },
        { id: 2, date: '2024-01-15', from: 'Mall', to: 'Residential', fare: 280, status: 'completed' },
        { id: 3, date: '2024-01-14', from: 'Hotel', to: 'Station', fare: 320, status: 'completed' }
      ]
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
          💰 My Earnings
        </h1>

        {/* Earnings Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Today</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#48bb78' }}>
              ₹{earnings.today}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>This Week</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
              ₹{earnings.thisWeek}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📈</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>This Month</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#ed8936' }}>
              ₹{earnings.thisMonth}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💎</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Total Earned</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#9333ea' }}>
              ₹{earnings.total}
            </p>
          </div>
        </div>

        {/* Recent Rides */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Recent Rides</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {earnings.rides.map((ride) => (
              <div key={ride.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#f7fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>
                    {ride.from} → {ride.to}
                  </h4>
                  <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>
                    {ride.date}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '700', color: '#48bb78' }}>
                    ₹{ride.fare}
                  </p>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {ride.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}