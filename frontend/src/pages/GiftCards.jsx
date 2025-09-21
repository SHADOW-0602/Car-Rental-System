import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function GiftCards() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                color: 'white',
                padding: '100px 20px 80px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
                    Gift Cards
                </h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    Give the gift of convenient transportation
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {[
                        { amount: '₹500', popular: false },
                        { amount: '₹1000', popular: true },
                        { amount: '₹2000', popular: false },
                        { amount: '₹5000', popular: false }
                    ].map((card, index) => (
                        <div key={index} style={{ 
                            backgroundColor: 'white', 
                            padding: '40px', 
                            borderRadius: '25px', 
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                            textAlign: 'center',
                            border: card.popular ? '3px solid #ec4899' : '2px solid #e2e8f0',
                            position: 'relative'
                        }}>
                            {card.popular && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#ec4899',
                                    color: 'white',
                                    padding: '5px 20px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    POPULAR
                                </div>
                            )}
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎁</div>
                            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>{card.amount}</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '25px' }}>
                                Perfect for friends, family, or colleagues who value convenient transportation.
                            </p>
                            <button style={{
                                padding: '15px 30px',
                                backgroundColor: '#ec4899',
                                color: 'white',
                                border: 'none',
                                borderRadius: '25px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%'
                            }}>
                                Buy Gift Card
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}