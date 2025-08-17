import React from 'react';
import '../styles/main.css';

export default function VehicleCard({ vehicle, onSelect }) {
  if (!vehicle) return null;

  const {
    make,
    model,
    vehicle_type,
    fare_per_km,
    availability,
    driver_id,
  } = vehicle;

  // Robust handling: driver_id could be string, object, null
  let driverName = 'N/A';
  if (driver_id) {
    if (typeof driver_id === 'object') {
      driverName = driver_id.name || 'N/A';
    }
    // If you use a field like driverName directly from backend, use that here.
  }

  return (
    <div
      onClick={() => onSelect(vehicle)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') onSelect(vehicle);
      }}
      style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-5px)';
        e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
      }}
    >
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: availability ? '#38a169' : '#e53e3e',
        color: 'white'
      }}>
        {availability ? '🟢 Available' : '🔴 Unavailable'}
      </div>

      {/* Vehicle Icon */}
      <div style={{
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: 'white',
        marginBottom: '20px'
      }}>
        🚗
      </div>

      {/* Vehicle Name */}
      <h3 style={{
        color: '#2d3748',
        margin: '0 0 15px 0',
        fontSize: '1.5rem',
        fontWeight: '700'
      }}>
        {make} {model}
      </h3>

      {/* Vehicle Details Grid */}
      <div style={{
        display: 'grid',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f7fafc',
          borderRadius: '10px'
        }}>
          <span style={{ marginRight: '10px', fontSize: '16px' }}>🚙</span>
          <span style={{ color: '#4a5568', fontWeight: '500' }}>
            {vehicle_type.charAt(0).toUpperCase() + vehicle_type.slice(1)}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f7fafc',
          borderRadius: '10px'
        }}>
          <span style={{ marginRight: '10px', fontSize: '16px' }}>💰</span>
          <span style={{ color: '#4a5568', fontWeight: '500' }}>
            ₹{fare_per_km}/km
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f7fafc',
          borderRadius: '10px'
        }}>
          <span style={{ marginRight: '10px', fontSize: '16px' }}>👤</span>
          <span style={{ color: '#4a5568', fontWeight: '500' }}>
            {driverName}
          </span>
        </div>
      </div>

      {/* Select Button */}
      <button
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        Select This Vehicle
      </button>
    </div>
  );
}