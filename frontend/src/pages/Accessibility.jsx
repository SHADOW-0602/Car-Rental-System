import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Accessibility() {
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
                    Accessibility
                </h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    Making transportation accessible for everyone
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>♿</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Wheelchair Accessible</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Our fleet includes wheelchair-accessible vehicles with ramps and secure wheelchair restraints.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>👁️</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Visual Assistance</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Screen reader compatible app with voice navigation and audio announcements for visually impaired users.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🤝</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Support Services</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Dedicated accessibility support team available 24/7 to assist with special transportation needs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}