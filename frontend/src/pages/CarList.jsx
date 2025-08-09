import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';
import Navbar from '../components/Navbar';

export default function CarList({ user }) {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicles(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchVehicles();
  }, []);

  return (
    <div>
      <Navbar user={user} />
      <h2>Available Cars</h2>
      {vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        vehicles.map(v => (
          <VehicleCard key={v._id} vehicle={v} onSelect={() => {}} />
        ))
      )}
    </div>
  );
}
