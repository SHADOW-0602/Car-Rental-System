import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Privacy() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                padding: '100px 20px',
                textAlign: 'center'
            }}>
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}
                >
                    Privacy Policy
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}
                >
                    Your privacy matters. Learn how we collect, use, and protect your information.
                </motion.p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            Information We Collect
                        </h2>
                        <p style={{ color: '#6b7280', lineHeight: '1.7', marginBottom: '15px' }}>
                            We collect information you provide directly, such as when you create an account, request a ride, or contact us for support.
                        </p>
                        <ul style={{ color: '#6b7280', lineHeight: '1.7', paddingLeft: '20px' }}>
                            <li>Personal information (name, email, phone number)</li>
                            <li>Location data for ride services</li>
                            <li>Payment information (processed securely)</li>
                            <li>Trip history and preferences</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            How We Use Your Information
                        </h2>
                        <ul style={{ color: '#6b7280', lineHeight: '1.7', paddingLeft: '20px' }}>
                            <li>Provide and improve our transportation services</li>
                            <li>Process payments and prevent fraud</li>
                            <li>Communicate with you about your rides</li>
                            <li>Ensure safety and security</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            Information Sharing
                        </h2>
                        <p style={{ color: '#6b7280', lineHeight: '1.7' }}>
                            We do not sell your personal information. We may share information with drivers for ride completion, 
                            payment processors for transactions, and law enforcement when required by law.
                        </p>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            Data Security
                        </h2>
                        <p style={{ color: '#6b7280', lineHeight: '1.7' }}>
                            We implement industry-standard security measures including encryption, secure servers, 
                            and regular security audits to protect your information.
                        </p>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            Your Rights
                        </h2>
                        <ul style={{ color: '#6b7280', lineHeight: '1.7', paddingLeft: '20px' }}>
                            <li>Access and update your personal information</li>
                            <li>Delete your account and associated data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Request data portability</li>
                        </ul>
                    </div>

                    <div style={{
                        backgroundColor: '#f0f9ff',
                        border: '2px solid #3b82f6',
                        borderRadius: '15px',
                        padding: '30px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px', color: '#1d4ed8' }}>
                            Questions About Privacy?
                        </h3>
                        <p style={{ color: '#1e40af', marginBottom: '20px' }}>
                            Contact our privacy team for any questions or concerns about your data.
                        </p>
                        <a href="/contact" className="btn btn-primary" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                            Contact Privacy Team
                        </a>
                    </div>

                    <div style={{ marginTop: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                        Last updated: January 2025
                    </div>
                </motion.div>
            </div>
        </div>
    );
}