import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function CarDetails({ user }) {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicle(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchVehicle();
  }, [id]);

  if (!vehicle) return <p>Loading...</p>;

  return (
    <div>
      <Navbar user={user} />
      <h2>{vehicle.make} {vehicle.model}</h2>
      <p>Type: {vehicle.vehicle_type}</p>
      <p>Fare: ₹{vehicle.fare_per_km}/km</p>
      <p>Status: {vehicle.availability ? 'Available' : 'Unavailable'}</p>
      <p>Driver: {vehicle.driver_id?.name || 'N/A'}</p>
    </div>
  );
}