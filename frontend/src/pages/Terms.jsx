import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Terms() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                padding: '100px 20px',
                textAlign: 'center'
            }}>
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}
                >
                    Terms of Service
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}
                >
                    Terms and conditions for using UrbanFleet services.
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
                            1. Acceptance of Terms
                        </h2>
                        <p style={{ color: '#6b7280', lineHeight: '1.7' }}>
                            By accessing and using UrbanFleet services, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            2. Service Description
                        </h2>
                        <p style={{ color: '#6b7280', lineHeight: '1.7' }}>
                            UrbanFleet provides a technology platform that connects riders with independent drivers. We do not provide transportation services directly.
                        </p>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            3. User Responsibilities
                        </h2>
                        <ul style={{ color: '#6b7280', lineHeight: '1.7', paddingLeft: '20px' }}>
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account</li>
                            <li>Comply with all applicable laws and regulations</li>
                            <li>Treat drivers and other users with respect</li>
                            <li>Pay all applicable fees and charges</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            4. Driver Requirements
                        </h2>
                        <ul style={{ color: '#6b7280', lineHeight: '1.7', paddingLeft: '20px' }}>
                            <li>Valid driver's license and insurance</li>
                            <li>Pass background checks and vehicle inspections</li>
                            <li>Maintain professional conduct</li>
                            <li>Follow all traffic laws and safety regulations</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            5. Payment Terms
                        </h2>
                        <p style={{ color: '#6b7280', lineHeight: '1.7' }}>
                            Payment is processed automatically through the app. Prices include base fare, distance, time, and applicable taxes. 
                            Cancellation fees may apply for cancelled rides.
                        </p>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            6. Limitation of Liability
                        </h2>
                        <p style={{ color: '#6b7280', lineHeight: '1.7' }}>
                            UrbanFleet's liability is limited to the maximum extent permitted by law. We are not liable for indirect, 
                            incidental, or consequential damages arising from use of our services.
                        </p>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', color: '#1f2937' }}>
                            7. Termination
                        </h2>
                        <p style={{ color: '#6b7280', lineHeight: '1.7' }}>
                            Either party may terminate this agreement at any time. UrbanFleet reserves the right to suspend or 
                            terminate accounts for violations of these terms.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '2px solid #f59e0b',
                        borderRadius: '15px',
                        padding: '30px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px', color: '#d97706' }}>
                            Questions About Terms?
                        </h3>
                        <p style={{ color: '#92400e', marginBottom: '20px' }}>
                            Contact our legal team for clarification on any terms or conditions.
                        </p>
                        <a href="/contact" className="btn btn-warning" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                            Contact Legal Team
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