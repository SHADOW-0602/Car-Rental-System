import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Safety() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                padding: '100px 20px',
                textAlign: 'center'
            }}>
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}
                >
                    Your Safety is Our Priority
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}
                >
                    Comprehensive safety measures to ensure every ride is secure and reliable.
                </motion.p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gap: '40px' }}>
                    {[
                        {
                            icon: '🛡️',
                            title: 'Driver Background Checks',
                            description: 'All drivers undergo comprehensive background checks including criminal history, driving records, and identity verification before joining our platform.'
                        },
                        {
                            icon: '📍',
                            title: 'Real-Time GPS Tracking',
                            description: 'Every ride is tracked in real-time with GPS technology. Share your trip details with trusted contacts for added security.'
                        },
                        {
                            icon: '🆘',
                            title: '24/7 Emergency Support',
                            description: 'Round-the-clock emergency support team ready to assist. One-tap emergency button connects you directly to local authorities.'
                        },
                        {
                            icon: '⭐',
                            title: 'Two-Way Rating System',
                            description: 'Both riders and drivers rate each other, maintaining high service standards and accountability across our platform.'
                        },
                        {
                            icon: '🔒',
                            title: 'Secure Payment Processing',
                            description: 'All payments are processed through encrypted, secure channels. No cash handling reduces safety risks for everyone.'
                        },
                        {
                            icon: '📱',
                            title: 'In-App Safety Features',
                            description: 'Share trip status, emergency contacts, route deviation alerts, and direct communication with our safety team.'
                        }
                    ].map((feature, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '30px',
                                backgroundColor: 'white',
                                padding: '30px',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ fontSize: '4rem', minWidth: '80px' }}>{feature.icon}</div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px', color: '#1f2937' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    style={{
                        backgroundColor: '#f0fdf4',
                        border: '2px solid #22c55e',
                        borderRadius: '20px',
                        padding: '40px',
                        textAlign: 'center',
                        marginTop: '60px'
                    }}
                >
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '20px', color: '#16a34a' }}>
                        Report Safety Concerns
                    </h2>
                    <p style={{ color: '#15803d', marginBottom: '30px', fontSize: '1.1rem' }}>
                        If you experience any safety issues, report them immediately through our app or contact our safety team directly.
                    </p>
                    <a href="/contact" className="btn btn-success" style={{ textDecoration: 'none', padding: '15px 30px' }}>
                        Contact Safety Team
                    </a>
                </motion.div>
            </div>
        </div>
    );
}