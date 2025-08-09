import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Bookings({ user }) {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    async function fetchRides() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/rides/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRides(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchRides();
  }, []);

  return (
    <div>
      <Navbar user={user} />
      <h2>My Rides</h2>
      {rides.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul>
          {rides.map(r => (
            <li key={r._id}>
              {r.pickup_location?.address} → {r.drop_location?.address} ({r.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
