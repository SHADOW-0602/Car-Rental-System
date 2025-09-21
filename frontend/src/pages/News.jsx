import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function News() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '100px 20px 80px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
                    Newsroom
                </h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    Latest updates and announcements from UrbanFleet
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gap: '40px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>UrbanFleet Launches Premium Service</h3>
                        <p style={{ color: '#64748b', marginBottom: '10px' }}>January 15, 2025</p>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            We're excited to announce the launch of our premium service tier, offering luxury vehicles and enhanced amenities for our valued customers.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Expansion to New Cities</h3>
                        <p style={{ color: '#64748b', marginBottom: '10px' }}>December 20, 2024</p>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            UrbanFleet is expanding operations to 5 new cities, bringing our reliable transportation services to more communities.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}