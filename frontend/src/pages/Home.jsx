import React, { useState } from 'react';
import RideBookingForm from '../components/RideBookingForm';
import VehicleCard from '../components/VehicleCard';
import Navbar from '../components/Navbar';

export default function Home({ user }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  return (
    <div>
      <Navbar user={user} />
      <h1>Welcome to Car Rental System</h1>
      
      {/* Pass setSelectedVehicle to the booking form */}
      <RideBookingForm
        user={user}
        onBooking={(ride, vehicle) => {
          console.log('Ride booked:', ride);
          if (vehicle) {
            setSelectedVehicle(vehicle);
          }
        }}
      />

      {/* Show selected vehicle card dynamically */}
      {selectedVehicle && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Selected Vehicle</h2>
          <VehicleCard vehicle={selectedVehicle} onSelect={() => {}} />
        </div>
      )}
    </div>
  );
}