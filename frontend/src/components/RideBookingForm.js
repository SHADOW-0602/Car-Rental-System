import React, { useState } from 'react';
import axios from 'axios';
import VehicleCard from './VehicleCard';
import MapPicker from './MapPicker'; // Import the new component

export default function RideBookingForm({ user, onBooking }) {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [ride, setRide] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickup || !drop) {
      alert('Please select both pickup and drop locations on the map.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/rides/request`,
        { pickup_location: pickup, drop_location: drop },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);
      setDrivers(res.data.nearbyDrivers || []);
      setRide(res.data.ride);
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.error || 'Booking failed');
    }
  };

  const handleVehicleSelect = async (driver) => {
    if (!ride) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/rides/confirm`,
        { rideId: ride._id, driverId: driver.driverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onBooking) onBooking(res.data);
      alert(`Ride confirmed with ${driver.driverId}!`);
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to confirm ride');
    }
  };

  return (
    <div>
      <form className="ride-booking-form" onSubmit={handleSubmit}>
        <h2>Request Ride</h2>
        
        <div className="location-pickers" style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <MapPicker label="Select Pickup Location" onLocationSelect={setPickup} />
            {pickup && <p><b>Selected:</b> {pickup.address}</p>}
          </div>
          <div style={{ flex: 1 }}>
            <MapPicker label="Select Drop-off Location" onLocationSelect={setDrop} />
            {drop && <p><b>Selected:</b> {drop.address}</p>}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Find Ride'}
        </button>
      </form>

      {drivers.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Nearby Drivers:</h3>
          {drivers.map((driver, idx) => (
            <VehicleCard
              key={idx}
              vehicle={{
                make: 'Available',
                model: 'Driver Vehicle',
                vehicle_type: 'economy',
                fare_per_km: 10,
                availability: true,
                driver_id: { name: driver.driverId },
              }}
              onSelect={() => handleVehicleSelect(driver)}
            />
          ))}
        </div>
      )}
    </div>
  );
}