import React from 'react';

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
      className="vehicle-card"
      onClick={() => onSelect(vehicle)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') onSelect(vehicle);
      }}
      style={{ cursor: 'pointer' }}
    >
      <h3>{make} {model}</h3>
      <p>Type: {vehicle_type}</p>
      <p>Fare: ₹{fare_per_km}/km</p>
      <p>Status: {availability ? 'Available' : 'Unavailable'}</p>
      <p>Driver: {driverName}</p>
    </div>
  );
}