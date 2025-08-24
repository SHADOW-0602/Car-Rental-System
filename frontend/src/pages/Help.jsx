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
    const [activeTab, setActiveTab] = useState('faq');
    const [feedback, setFeedback] = useState('');

    useNotifications();

    const handleStartChat = () => {
        setShowChatModal(true);
    };

    const submitFeedback = () => {
        if (feedback.trim()) {
            alert('Thank you for your feedback! We appreciate your input.');
            setFeedback('');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
                    ❓ Help & Support
                </h1>
                
                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'faq', label: user?.role === 'driver' ? '🚕 Driver FAQ' : '❓ FAQ', icon: '❓' },
                        { id: 'contact', label: '📞 Contact Support', icon: '📞' },
                        { id: 'payment', label: user?.role === 'driver' ? '💰 Earnings Help' : '💳 Payment Help', icon: '💳' },
                        { id: 'feedback', label: '📱 App Feedback', icon: '📱' },
                        { id: 'guide', label: user?.role === 'driver' ? '🚕 Driver Guide' : '📚 User Guide', icon: '📚' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                borderRadius: '10px',
                                backgroundColor: activeTab === tab.id ? '#667eea' : 'white',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gap: '25px' }}>

                    {/* Contact Support Tab */}
                    {activeTab === 'contact' && (
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
                    )}

                    {/* FAQ Tab */}
                    {activeTab === 'faq' && (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                                {user?.role === 'driver' ? '🚕 Driver FAQ' : '❓ Frequently Asked Questions'}
                            </h2>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {user?.role === 'driver' ? (
                                    <>
                                        <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                            <summary style={{ fontWeight: '600', color: '#2d3748' }}>How do I accept ride requests?</summary>
                                            <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>When you receive a ride request, you'll see passenger details and pickup location. Tap "Accept" to confirm the ride. You have 30 seconds to respond.</p>
                                        </details>
                                        <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                            <summary style={{ fontWeight: '600', color: '#2d3748' }}>How are my earnings calculated?</summary>
                                            <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>You earn a percentage of each ride fare plus tips. Base fare varies by vehicle type and distance. Weekly bonuses are available for completing certain ride targets.</p>
                                        </details>
                                        <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                            <summary style={{ fontWeight: '600', color: '#2d3748' }}>When do I get paid?</summary>
                                            <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>Earnings are transferred to your bank account weekly on Tuesdays. You can also cash out instantly for a small fee through the Driver Portal.</p>
                                        </details>
                                        <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                            <summary style={{ fontWeight: '600', color: '#2d3748' }}>What if a passenger cancels?</summary>
                                            <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>If a passenger cancels after you've started driving to pickup, you'll receive a cancellation fee. If they cancel before you start driving, no fee is charged.</p>
                                        </details>
                                        <details style={{ padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px', cursor: 'pointer' }}>
                                            <summary style={{ fontWeight: '600', color: '#2d3748' }}>How do I update my availability?</summary>
                                            <p style={{ marginTop: '10px', color: '#64748b', lineHeight: '1.6' }}>Use the availability toggle in your Driver Portal. When offline, you won't receive ride requests. Remember to go online when you're ready to drive.</p>
                                        </details>
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Help Tab */}
                    {activeTab === 'payment' && (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                                {user?.role === 'driver' ? '💰 Earnings Help' : '💳 Payment Help'}
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {user?.role === 'driver' ? (
                                    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '15px', border: '1px solid #bae6fd' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>How Driver Earnings Work</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b' }}>
                                            <li>Base fare: 80% of ride fare goes to you</li>
                                            <li>Tips: 100% of passenger tips</li>
                                            <li>Bonuses: Weekly and monthly incentives</li>
                                            <li>Peak hours: Higher rates during busy times</li>
                                            <li>Referrals: Earn bonuses for new driver referrals</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '15px', border: '1px solid #bae6fd' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>Accepted Payment Methods</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b' }}>
                                            <li>Credit Cards (Visa, MasterCard, American Express)</li>
                                            <li>Debit Cards</li>
                                            <li>Digital Wallets (PayPal, Apple Pay, Google Pay)</li>
                                            <li>UPI Payments</li>
                                            <li>Cash Payments (for select rides)</li>
                                        </ul>
                                    </div>
                                )}
                                
                                {user?.role === 'driver' ? (
                                    <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '15px', border: '1px solid #bbf7d0' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>Payment Schedule</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b' }}>
                                            <li>Weekly payouts every Tuesday</li>
                                            <li>Instant cash-out available (small fee applies)</li>
                                            <li>Direct bank transfer to your account</li>
                                            <li>Detailed earnings breakdown in Driver Portal</li>
                                            <li>Tax documents provided annually</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '15px', border: '1px solid #bbf7d0' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>Payment Issues?</h3>
                                        <p style={{ margin: '0 0 15px 0', color: '#64748b' }}>If you're experiencing payment problems:</p>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b' }}>
                                            <li>Check your card details and expiry date</li>
                                            <li>Ensure sufficient balance in your account</li>
                                            <li>Try a different payment method</li>
                                            <li>Contact your bank if the issue persists</li>
                                        </ul>
                                    </div>
                                )}
                                
                                <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '15px', border: '1px solid #fde68a' }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#d97706' }}>Refunds & Cancellations</h3>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b' }}>
                                        <li>Free cancellation within 5 minutes of booking</li>
                                        <li>Refunds processed within 3-5 business days</li>
                                        <li>Partial refunds for driver cancellations</li>
                                        <li>Contact support for refund status</li>
                                    </ul>
                                </div>
                                
                                <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '15px', border: '1px solid #fecaca', textAlign: 'center' }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Need Immediate Help?</h3>
                                    <p style={{ margin: '0 0 15px 0', color: '#64748b' }}>Contact our payment support team</p>
                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <a href="tel:+15551234567" style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
                                            📞 Call Support
                                        </a>
                                        <a href="mailto:payments@carrental.com" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
                                            📧 Email Us
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* App Feedback Tab */}
                    {activeTab === 'feedback' && (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                                📱 App Feedback
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '15px' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>We Value Your Opinion!</h3>
                                    <p style={{ margin: '0 0 20px 0', color: '#64748b' }}>Help us improve the Car Rental System by sharing your feedback, suggestions, or reporting any issues you've encountered.</p>
                                    
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Share your thoughts about the app, suggest new features, or report any issues..."
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '15px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            outline: 'none'
                                        }}
                                    />
                                    
                                    <button
                                        onClick={submitFeedback}
                                        disabled={!feedback.trim()}
                                        style={{
                                            marginTop: '15px',
                                            padding: '12px 24px',
                                            backgroundColor: feedback.trim() ? '#667eea' : '#94a3b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: feedback.trim() ? 'pointer' : 'not-allowed',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '15px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⭐</div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#1e40af' }}>Rate Our App</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Share your experience</p>
                                    </div>
                                    <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '15px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>💡</div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#16a34a' }}>Suggest Features</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Help us innovate</p>
                                    </div>
                                    <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '15px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🐛</div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#d97706' }}>Report Bugs</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Help us fix issues</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Guide Tab */}
                    {activeTab === 'guide' && (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                                {user?.role === 'driver' ? '🚕 Driver Guide' : '📚 User Guide'}
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {user?.role === 'driver' ? (
                                    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '15px', border: '1px solid #bae6fd' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>🚕 Getting Started as Driver</h3>
                                        <ol style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Complete driver verification and background check</li>
                                            <li>Upload required documents (license, insurance, vehicle registration)</li>
                                            <li>Set up your bank account for earnings</li>
                                            <li>Complete vehicle inspection</li>
                                            <li>Go online and start accepting rides</li>
                                        </ol>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '15px', border: '1px solid #bae6fd' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>🚗 Getting Started</h3>
                                        <ol style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Create your account with email verification</li>
                                            <li>Add your payment method in Profile settings</li>
                                            <li>Enable location services for better experience</li>
                                            <li>Complete your profile information</li>
                                        </ol>
                                    </div>
                                )}
                                
                                {user?.role === 'driver' ? (
                                    <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '15px', border: '1px solid #bbf7d0' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#16a34a' }}>📱 Accepting Rides</h3>
                                        <ol style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Keep your app online to receive ride requests</li>
                                            <li>Review passenger pickup location and destination</li>
                                            <li>Accept or decline within 30 seconds</li>
                                            <li>Navigate to pickup location using in-app GPS</li>
                                            <li>Confirm passenger identity and start the trip</li>
                                        </ol>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '15px', border: '1px solid #bbf7d0' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#16a34a' }}>📍 Booking a Ride</h3>
                                        <ol style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Enter your pickup location (or use current location)</li>
                                            <li>Set your destination address</li>
                                            <li>Choose your preferred vehicle type</li>
                                            <li>Review fare estimate and confirm booking</li>
                                            <li>Track your driver's arrival in real-time</li>
                                        </ol>
                                    </div>
                                )}
                                
                                {user?.role === 'driver' ? (
                                    <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '15px', border: '1px solid #fde68a' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#d97706' }}>💰 Maximizing Earnings</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Drive during peak hours for higher rates</li>
                                            <li>Complete weekly ride targets for bonuses</li>
                                            <li>Maintain high ratings for priority requests</li>
                                            <li>Use surge pricing areas during busy times</li>
                                            <li>Refer new drivers to earn referral bonuses</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '15px', border: '1px solid #fde68a' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#d97706' }}>💳 Payment & Billing</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Automatic payment after ride completion</li>
                                            <li>View detailed fare breakdown</li>
                                            <li>Download invoices from Bookings section</li>
                                            <li>Manage payment methods in Profile</li>
                                            <li>Set up automatic tips for drivers</li>
                                        </ul>
                                    </div>
                                )}
                                
                                {user?.role === 'driver' ? (
                                    <div style={{ padding: '20px', backgroundColor: '#f3e8ff', borderRadius: '15px', border: '1px solid #d8b4fe' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#7c3aed' }}>⚙️ Driver Account Management</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Update vehicle information and documents</li>
                                            <li>Manage availability and working hours</li>
                                            <li>View earnings history and tax documents</li>
                                            <li>Track performance metrics and ratings</li>
                                            <li>Update bank account for payouts</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', backgroundColor: '#f3e8ff', borderRadius: '15px', border: '1px solid #d8b4fe' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#7c3aed' }}>⚙️ Account Management</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Update personal information in Profile</li>
                                            <li>Change password and enable 2FA</li>
                                            <li>View ride history and receipts</li>
                                            <li>Manage notification preferences</li>
                                            <li>Rate and review your rides</li>
                                        </ul>
                                    </div>
                                )}
                                
                                {user?.role === 'driver' ? (
                                    <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '15px', border: '1px solid #fecaca' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#dc2626' }}>🛡️ Driver Safety</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Emergency button for immediate assistance</li>
                                            <li>Real-time location sharing with support</li>
                                            <li>Passenger verification before starting trips</li>
                                            <li>Report unsafe passengers or incidents</li>
                                            <li>24/7 driver support hotline available</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '15px', border: '1px solid #fecaca' }}>
                                        <h3 style={{ margin: '0 0 15px 0', color: '#dc2626' }}>🆘 Safety Features</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8' }}>
                                            <li>Share ride details with emergency contacts</li>
                                            <li>In-app emergency button for immediate help</li>
                                            <li>Driver verification and background checks</li>
                                            <li>Real-time GPS tracking during rides</li>
                                            <li>24/7 customer support availability</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


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