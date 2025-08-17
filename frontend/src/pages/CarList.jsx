import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';
import Navbar from '../components/Navbar';
import config from '../config';
import '../styles/main.css';

export default function CarList({ user }) {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found for vehicles');
          return;
        }
        
        const res = await axios.get(`${config.API_BASE_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicles(res.data);
      } catch (err) {
        console.error('Error fetching vehicles:', err.response?.status, err.response?.data);
        if (err.response?.status === 400) {
          console.log('Bad request - likely authentication issue. Please log in first.');
        }
      }
    }
    fetchVehicles();
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
          Available Vehicles
        </h1>
        <p style={{
          fontSize: '1.1rem',
          opacity: '0.9',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Choose from our premium fleet of vehicles for your journey
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {vehicles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚗</div>
            <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>No Vehicles Found</h3>
            <p style={{ color: '#718096', fontSize: '16px' }}>
              We're currently updating our fleet. Please check back later!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '30px',
            marginBottom: '40px'
          }}>
            {vehicles.map(v => (
              <VehicleCard key={v._id} vehicle={v} onSelect={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
