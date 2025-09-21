import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Cities() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                padding: '100px 20px 80px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
                    Cities We Serve
                </h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    UrbanFleet is available in major cities across India
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {[
                        { name: 'Delhi NCR', icon: '🏛️', status: 'Available' },
                        { name: 'Mumbai', icon: '🌊', status: 'Available' },
                        { name: 'Bangalore', icon: '🌳', status: 'Available' },
                        { name: 'Chennai', icon: '🏖️', status: 'Available' },
                        { name: 'Hyderabad', icon: '💎', status: 'Available' },
                        { name: 'Pune', icon: '🎓', status: 'Available' },
                        { name: 'Kolkata', icon: '🎭', status: 'Coming Soon' },
                        { name: 'Ahmedabad', icon: '🏭', status: 'Coming Soon' },
                        { name: 'Jaipur', icon: '🏰', status: 'Coming Soon' }
                    ].map((city, index) => (
                        <div key={index} style={{ 
                            backgroundColor: 'white', 
                            padding: '30px', 
                            borderRadius: '20px', 
                            boxShadow: '0 15px 35px rgba(0,0,0,0.1)', 
                            textAlign: 'center',
                            border: city.status === 'Available' ? '2px solid #22c55e' : '2px solid #f59e0b'
                        }}>
                            <div style={{ fontSize: '50px', marginBottom: '15px' }}>{city.icon}</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2d3748', marginBottom: '10px' }}>{city.name}</h3>
                            <div style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: city.status === 'Available' ? '#dcfce7' : '#fef3c7',
                                color: city.status === 'Available' ? '#16a34a' : '#d97706'
                            }}>
                                {city.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}