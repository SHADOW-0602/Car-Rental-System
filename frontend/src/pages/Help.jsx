import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';
import ReportIssueModal from '../components/ReportIssueModal';
import LiveChatModal from '../components/LiveChatModal';

import useNotifications from '../hooks/useNotifications';

export default function Help() {
    const { user } = useAuthContext();
    const [showReportModal, setShowReportModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);

    useNotifications();

    const handleStartChat = () => {
        setShowChatModal(true);
    };

    const handlePaymentHelp = () => {
        alert('Payment help: For payment issues, please contact support at +1 (555) 123-4567 or email support@carrental.com');
    };

    const handleAppFeedback = () => {
        const feedback = prompt('Please share your feedback about the app:');
        if (feedback) {
            alert('Thank you for your feedback! We appreciate your input.');
        }
    };

    const handleUserGuide = () => {
        alert('User guide will be available soon. For now, check our FAQ section above!');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
                    ❓ Help & Support
                </h1>
                <div style={{ display: 'grid', gap: '25px' }}>
                    {/* Contact Support */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                            📞 Contact Support
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                            <div style={{ padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📞</div>
                                <h3 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Phone Support</h3>
                                <p style={{ margin: 0, color: '#64748b' }}>+1 (555) 123-4567</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>24/7 Available</p>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📬</div>
                                <h3 style={{ margin: '0 0 8px 0', color: '#16a34a' }}>Email Support</h3>
                                <p style={{ margin: 0, color: '#64748b' }}>support@carrental.com</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>Response within 2 hours</p>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>💬</div>
                                <h3 style={{ margin: '0 0 8px 0', color: '#d97706' }}>Live Chat</h3>
                                <button onClick={handleStartChat} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Start Chat</button>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>Online now</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                            ❓ Frequently Asked Questions
                        </h2>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: '#2d3748' }}>How do I book a ride?</summary>
                                <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>Simply select your pickup and drop-off locations on the home page, choose your preferred vehicle, and confirm your booking. You'll be matched with a nearby driver instantly.</p>
                            </details>
                            <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: '#2d3748' }}>Can I cancel my ride?</summary>
                                <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>Yes, you can cancel your ride up to 5 minutes after booking without any charges. After that, standard cancellation fees may apply.</p>
                            </details>
                            <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: '#2d3748' }}>What payment methods do you accept?</summary>
                                <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>We accept all major credit cards, debit cards, digital wallets, and cash payments. You can manage your payment methods in your profile settings.</p>
                            </details>
                            <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: '#2d3748' }}>How is the fare calculated?</summary>
                                <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>Fares are calculated based on distance, time, vehicle type, and current demand. You'll see the estimated fare before confirming your booking.</p>
                            </details>
                            <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: '#2d3748' }}>Is my personal information safe?</summary>
                                <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>Absolutely! We use industry-standard encryption to protect your data and never share your personal information with third parties without your consent.</p>
                            </details>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                            🚀 Quick Actions
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <button onClick={() => setShowReportModal(true)} style={{ padding: '15px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                📝 Report an Issue
                            </button>
                            <button onClick={handlePaymentHelp} style={{ padding: '15px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                💳 Payment Help
                            </button>
                            <button onClick={handleAppFeedback} style={{ padding: '15px', backgroundColor: '#ed8936', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                📱 App Feedback
                            </button>
                            <button onClick={handleUserGuide} style={{ padding: '15px', backgroundColor: '#9f7aea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                📚 User Guide
                            </button>

                        </div>
                    </div>
                </div>
                
                <ReportIssueModal 
                    isOpen={showReportModal} 
                    onClose={() => setShowReportModal(false)} 
                />
                
                <LiveChatModal 
                    isOpen={showChatModal} 
                    onClose={() => setShowChatModal(false)} 
                />
                

            </div>
        </div>
    );
}