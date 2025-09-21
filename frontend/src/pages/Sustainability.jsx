import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Sustainability() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                padding: '100px 20px 80px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
                    Sustainability
                </h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    Building a greener future through sustainable transportation
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '80px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔋</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Electric Fleet</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            50% of our fleet consists of electric and hybrid vehicles, reducing carbon emissions by 40%.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌱</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Carbon Neutral</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            We offset 100% of our carbon footprint through verified environmental projects.
                        </p>
                    </div>
                    
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>♻️</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Waste Reduction</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            Digital receipts, paperless operations, and vehicle recycling programs.
                        </p>
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                    borderRadius: '30px',
                    padding: '60px 40px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '50px' }}>
                        Our Environmental Impact
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', color: '#22c55e' }}>
                                2M+
                            </div>
                            <p style={{ opacity: 0.9, color: '#64748b' }}>CO₂ Tons Saved</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', color: '#22c55e' }}>
                                500K
                            </div>
                            <p style={{ opacity: 0.9, color: '#64748b' }}>Trees Planted</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', color: '#22c55e' }}>
                                75%
                            </div>
                            <p style={{ opacity: 0.9, color: '#64748b' }}>Renewable Energy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}