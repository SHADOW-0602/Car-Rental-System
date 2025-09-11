import React from 'react';

export default function SimpleMap({ 
  driverLocation, 
  pickupLocation, 
  dropLocation, 
  rideStatus 
}) {
  // Simple map visualization using CSS
  const getLocationStyle = (location, type) => {
    if (!location) return {};
    
    // Simple positioning based on coordinates (mock implementation)
    const x = ((location.longitude + 180) / 360) * 100;
    const y = ((90 - location.latitude) / 180) * 100;
    
    return {
      position: 'absolute',
      left: `${Math.min(Math.max(x, 5), 95)}%`,
      top: `${Math.min(Math.max(y, 5), 95)}%`,
      transform: 'translate(-50%, -50%)',
      zIndex: type === 'driver' ? 3 : 2
    };
  };

  return (
    <div className="simple-map">
      <div className="map-container">
        <div className="map-background">
          {/* Grid pattern to simulate map */}
          <div className="map-grid"></div>
          
          {/* Pickup Location */}
          {pickupLocation && (
            <div 
              className="map-marker pickup-marker" 
              style={getLocationStyle(pickupLocation, 'pickup')}
              title={pickupLocation.address || 'Pickup Location'}
            >
              <div className="marker-icon">📍</div>
              <div className="marker-label">Pickup</div>
            </div>
          )}
          
          {/* Drop Location */}
          {dropLocation && (
            <div 
              className="map-marker drop-marker" 
              style={getLocationStyle(dropLocation, 'drop')}
              title={dropLocation.address || 'Drop Location'}
            >
              <div className="marker-icon">🎯</div>
              <div className="marker-label">Destination</div>
            </div>
          )}
          
          {/* Driver Location */}
          {driverLocation && (
            <div 
              className="map-marker driver-marker" 
              style={getLocationStyle(driverLocation, 'driver')}
              title={driverLocation.address || 'Driver Location'}
            >
              <div className="marker-icon moving">🚗</div>
              <div className="marker-label">Driver</div>
              <div className="driver-pulse"></div>
            </div>
          )}
          
          {/* Route line (simplified) */}
          {driverLocation && (rideStatus === 'accepted' ? pickupLocation : dropLocation) && (
            <div className="route-line"></div>
          )}
        </div>
        
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-icon">📍</span>
            <span>Pickup</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🚗</span>
            <span>Driver</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🎯</span>
            <span>Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
}