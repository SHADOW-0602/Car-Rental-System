import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user }) {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/vehicles">Vehicles</Link>
      <Link to="/bookings">Your Rides</Link>
      {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      {!user ? (
        <Link to="/login">Login</Link>
      ) : (
        <Link to="/profile">Profile</Link>
      )}
    </nav>
  );
}