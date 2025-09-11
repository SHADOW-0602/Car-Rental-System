import React from 'react';

export default function DriverCard({ driver, fareEstimate, vehicleType, isSelected, onSelect, onBook, loading }) {
  return (
    <div
      style={{
        border: `2px solid ${isSelected ? '#667eea' : '#e2e8f0'}`,
        borderRadius: '15px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: isSelected ? '#f0f9ff' : 'white',
        transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isSelected ? '0 8px 25px rgba(102, 126, 234, 0.15)' : '0 2px 10px rgba(0,0,0,0.1)'
      }}
      onClick={() => onSelect(driver._id)}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#667eea',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}>
            {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '18px' }}>
              {driver.name || 'Driver'}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '5px' }}>
              <span style={{ 
                color: '#f59e0b', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⭐ {driver.rating || '4.5'}
              </span>
              <span style={{ 
                color: '#10b981', 
                fontSize: '14px',
                backgroundColor: '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                🚗 {vehicleType.toUpperCase()}
              </span>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📍 {Math.round(driver.distance * 10) / 10} km away</span>
              <span>•</span>
              <span>⏱️ {driver.eta || Math.ceil(driver.distance * 2)} min ETA</span>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#059669',
            marginBottom: '5px'
          }}>
            ₹{fareEstimate?.estimatedFare || 0}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            padding: '4px 8px',
            borderRadius: '8px'
          }}>
            Fixed Price
          </div>
        </div>
      </div>
      
      {isSelected && (
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Trip Details:</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>
              {Math.round((fareEstimate?.distance || 0) * 10) / 10} km • {fareEstimate?.estimatedTime || 0} min
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(driver._id);
            }}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 24px',
              backgroundColor: loading ? '#9ca3af' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#16a34a';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#22c55e';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Booking...
              </span>
            ) : (
              '✅ Confirm Booking'
            )}
          </button>
        </div>
      )}
    </div>
  );
}