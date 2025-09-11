import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

import { fadeIn } from '../animations/variants';
import { AnimatedContainer, AnimatedCard } from '../animations/AnimatedComponents';

export default function Help() {
    const { user } = useAuthContext();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [supportMessages, setSupportMessages] = useState([]);
    
    useEffect(() => {
        if (user) {
            loadSupportMessages();
        }
    }, [user]);
    
    const loadSupportMessages = async () => {
        try {
            const response = await api.get('/contact-replies');
            if (response.data.success) {
                setSupportMessages(response.data.replies);
            }
        } catch (error) {
            console.error('Error loading support messages:', error);
        }
    };

    const faqData = [
        {
            question: "How do I book a ride?",
            answer: "Simply enter your pickup and destination locations, select your preferred vehicle type, and confirm your booking."
        },
        {
            question: "How can I cancel my ride?",
            answer: "You can cancel your ride from the 'My Rides' section before the driver arrives. Cancellation fees may apply."
        },
        {
            question: "How do I become a driver?",
            answer: "Click on 'Become a Driver' and complete the application process with required documents."
        },
        {
            question: "What payment methods are accepted?",
            answer: "We accept credit/debit cards, digital wallets, and cash payments."
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <AnimatedContainer 
                variants={fadeIn}
                style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '10px' }}>
                        🆘 Help & Support
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                        We're here to help you with any questions or issues
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                    {/* Live Chat Card */}
                    <AnimatedCard style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Support</h3>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>
                            Get instant help from our support team
                        </p>
                        <a
                            href="/contact"
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}
                        >
                            Contact Support
                        </a>
                    </AnimatedCard>

                    {/* Contact Info Card */}
                    <AnimatedCard style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📞</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Contact Us</h3>
                        <div style={{ color: '#64748b', lineHeight: '1.6' }}>
                            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                            <p><strong>Email:</strong> support@carrental.com</p>
                            <p><strong>Hours:</strong> 24/7 Support</p>
                        </div>
                    </AnimatedCard>
                </div>

                {/* FAQ Section */}
                <AnimatedCard style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    marginBottom: '30px'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
                        ❓ Frequently Asked Questions
                    </h2>
                    
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {faqData.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    padding: '20px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    backgroundColor: '#f8fafc'
                                }}
                            >
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#1e293b' }}>
                                    {faq.question}
                                </h4>
                                <p style={{ color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                                    {faq.answer}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </AnimatedCard>

                {/* Support Message Replies */}
                {user && supportMessages.length > 0 && (
                    <AnimatedCard style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', textAlign: 'center', color: '#1e293b' }}>
                            📧 Your Support Message Replies
                        </h2>
                        
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {supportMessages.map(message => (
                                <div key={message._id} style={{
                                    padding: '20px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    backgroundColor: '#f8fafc'
                                }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.1rem' }}>{message.subject}</h3>
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                                            Sent: {new Date(message.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    <div style={{ padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '15px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Your Message:</div>
                                        <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>{message.message}</p>
                                    </div>
                                    
                                    <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                        <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '8px', fontWeight: '600' }}>
                                            Admin Reply - {new Date(message.reply.repliedAt).toLocaleString()}
                                        </div>
                                        <p style={{ margin: 0, color: '#1e293b', lineHeight: '1.6' }}>{message.reply.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AnimatedCard>
                )}

                {/* Emergency Contact */}
                <AnimatedCard style={{
                    backgroundColor: '#fef2f2',
                    border: '2px solid #fecaca',
                    padding: '25px',
                    borderRadius: '15px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '15px' }}>🚨</div>
                    <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>Emergency Contact</h3>
                    <p style={{ color: '#7f1d1d', marginBottom: '15px' }}>
                        For urgent safety concerns or emergencies during your ride
                    </p>
                    <a
                        href="tel:911"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600'
                        }}
                    >
                        Call Emergency: 911
                    </a>
                </AnimatedCard>
            </AnimatedContainer>


        </div>
    );
}