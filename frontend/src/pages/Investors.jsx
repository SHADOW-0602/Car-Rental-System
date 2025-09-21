import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Investors() {
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
                    Investor Relations
                </h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    Building the future of transportation together
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>📈</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Financial Reports</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Access our quarterly and annual financial reports, earnings calls, and investor presentations.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎯</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Growth Strategy</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Learn about our strategic initiatives and expansion plans for sustainable growth.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>📊</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Market Performance</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Track our market performance and key business metrics in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}