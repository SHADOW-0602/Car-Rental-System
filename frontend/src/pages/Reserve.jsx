import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Reserve() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                padding: '100px 20px 80px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
                    Reserve Your Ride
                </h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    Book your transportation in advance for guaranteed availability
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>📅</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Advance Booking</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Reserve your ride up to 30 days in advance. Perfect for important meetings and events.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>⏰</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Scheduled Rides</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Set up recurring rides for your daily commute or regular appointments.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎯</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Priority Service</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Reserved rides get priority matching with our best-rated drivers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}