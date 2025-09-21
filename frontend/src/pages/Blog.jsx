import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Blog() {
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
                    UrbanFleet Blog
                </h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    Insights, tips, and stories from the world of transportation
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gap: '40px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>5 Tips for Safe Urban Travel</h3>
                        <p style={{ color: '#64748b', marginBottom: '10px' }}>January 10, 2025</p>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Discover essential safety tips for navigating city transportation. From choosing the right vehicle to staying alert during your journey.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>The Future of Electric Vehicles</h3>
                        <p style={{ color: '#64748b', marginBottom: '10px' }}>December 28, 2024</p>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Exploring how electric vehicles are transforming the transportation industry and our commitment to sustainability.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Driver Success Stories</h3>
                        <p style={{ color: '#64748b', marginBottom: '10px' }}>December 15, 2024</p>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Meet our amazing driver partners and learn how UrbanFleet has helped them achieve their goals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}