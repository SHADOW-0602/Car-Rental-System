import React, { useState } from 'react';
import axios from 'axios';
import VehicleCard from './VehicleCard';

export default function RideBookingForm({ user, onBooking }) {
  const [pickup, setPickup] = useState({ latitude: '', longitude: '', address: '' });
  const [drop, setDrop] = useState({ latitude: '', longitude: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (onBooking) onBooking(res.data.ride, null);
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.error || 'Booking failed');
    }
  };

  const handleVehicleSelect = (vehicle) => {
    if (onBooking) onBooking(null, vehicle);
  };

  return (
    <div>
      <form className="ride-booking-form" onSubmit={handleSubmit}>
        <h2>Request Ride</h2>

        <label>
          Pickup Latitude:
          <input
            type="number"
            value={pickup.latitude}
            onChange={e => setPickup({ ...pickup, latitude: e.target.value })}
            required
          />
        </label>

        <label>
          Pickup Longitude:
          <input
            type="number"
            value={pickup.longitude}
            onChange={e => setPickup({ ...pickup, longitude: e.target.value })}
            required
          />
        </label>

        <label>
          Pickup Address:
          <input
            type="text"
            value={pickup.address}
            onChange={e => setPickup({ ...pickup, address: e.target.value })}
            required
          />
        </label>

        <label>
          Drop Latitude:
          <input
            type="number"
            value={drop.latitude}
            onChange={e => setDrop({ ...drop, latitude: e.target.value })}
            required
          />
        </label>

        <label>
          Drop Longitude:
          <input
            type="number"
            value={drop.longitude}
            onChange={e => setDrop({ ...drop, longitude: e.target.value })}
            required
          />
        </label>

        <label>
          Drop Address:
          <input
            type="text"
            value={drop.address}
            onChange={e => setDrop({ ...drop, address: e.target.value })}
            required
          />
        </label>

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
                make: 'Unknown',
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