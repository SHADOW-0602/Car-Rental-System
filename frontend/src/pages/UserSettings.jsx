import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import TwoFactorAuth from '../components/TwoFactorAuth';
import DriverApplicationModal from '../components/DriverApplicationModal';
import DeleteAccount from '../components/DeleteAccount';
import api from '../services/api';

export default function UserSettings() {
    const { user } = useAuthContext();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [driverApplicationStatus, setDriverApplicationStatus] = useState(null);
    const [settings, setSettings] = useState({
        shareLocation: true,
        marketingEmails: false,
        showProfile: true,
        rideUpdates: true,
        promotionalOffers: false,
        emailNotifications: true
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await api.get('/users/settings');
                if (response.data.success) {
                    setSettings(prev => ({ ...prev, ...response.data.settings }));
                }
            } catch (error) {
                console.error('Failed to load settings:', error.response?.data || error.message);
            }
        };
        
        const checkDriverStatus = async () => {
            try {
                console.log('Checking driver status...');
                const response = await api.get('/users/driver-status');
                console.log('Driver status response:', response.data);
                if (response.data.success) {
                    setDriverApplicationStatus(response.data.status);
                } else {
                    setDriverApplicationStatus(null);
                }
            } catch (error) {
                console.error('Failed to check driver status:', error);
                setDriverApplicationStatus(null);
            }
        };
        
        loadSettings();
        checkDriverStatus();
    }, []);

    const handleSettingChange = async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        try {
            await api.put('/users/settings', { [key]: value });
        } catch (error) {
            console.error('Failed to update setting:', error.response?.data || error.message);
            setSettings(prev => ({ ...prev, [key]: !value }));
        }
    };

    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
                    ⚙️ User Settings
                </h1>
                <div style={{ display: 'grid', gap: '25px' }}>
                    
                    {/* Become a Driver - Only for non-drivers */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        border: '2px solid #22c55e'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            🚕 Become a Driver & Start Earning
                        </h2>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#64748b', marginBottom: '15px', lineHeight: '1.6' }}>
                                Join our driver network and start earning money by providing rides to passengers. Flexible hours, competitive rates, and weekly payouts.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                                    <div style={{ fontWeight: '600', color: '#16a34a' }}>Earn ₹15,000-₹40,000</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Per month</div>
                                </div>
                                <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏰</div>
                                    <div style={{ fontWeight: '600', color: '#0369a1' }}>Flexible Hours</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Work when you want</div>
                                </div>
                                <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
                                    <div style={{ fontWeight: '600', color: '#d97706' }}>Easy App</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Simple to use</div>
                                </div>
                            </div>
                        </div>
                        
                        {!driverApplicationStatus && (
                            <div style={{ textAlign: 'center' }}>
                                <button 
                                    onClick={() => setShowDriverModal(true)}
                                    style={{
                                        padding: '15px 30px',
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    🚀 Apply to Become a Driver
                                </button>
                                <p style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                                    Application takes 5-10 minutes • Get approved in 24-48 hours
                                </p>
                            </div>
                        )}
                        
                        {driverApplicationStatus === 'pending' && (
                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#d97706' }}>Application Under Review</h3>
                                <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>We're reviewing your driver application. You'll receive an email update within 24-48 hours.</p>
                            </div>
                        )}
                        
                        {driverApplicationStatus === 'approved' && (
                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>Congratulations! You're Approved</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#065f46', fontSize: '14px' }}>Your account has been migrated to driver. Please logout and login again with driver credentials.</p>
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        window.location.href = '/driver/login';
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '25px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Go to Driver Login
                                </button>
                            </div>
                        )}
                        
                        {driverApplicationStatus === 'rejected' && (
                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '10px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>❌</div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Application Not Approved</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#991b1b', fontSize: '14px' }}>Unfortunately, your application didn't meet our requirements. You can reapply after 30 days.</p>
                                <button 
                                    onClick={() => setShowDriverModal(true)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Reapply Now
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Two-Factor Authentication */}
                    <TwoFactorAuth user={user} />
                    
                    {/* Account Settings */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                            👤 Account Settings
                        </h2>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Change Password</span>
                                <button onClick={() => setShowPasswordModal(true)} style={{ padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Update</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Delete Account</span>
                                <button onClick={() => setShowDeleteAccount(!showDeleteAccount)} style={{ padding: '8px 16px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                            </div>
                            {showDeleteAccount && (
                                <div style={{ marginTop: '15px' }}>
                                    <DeleteAccount />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                            🔒 Privacy Settings
                        </h2>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Share Location Data</span>
                                <input type="checkbox" checked={settings.shareLocation} onChange={(e) => handleSettingChange('shareLocation', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Allow Marketing Emails</span>
                                <input type="checkbox" checked={settings.marketingEmails} onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Show Profile to Other Users</span>
                                <input type="checkbox" checked={settings.showProfile} onChange={(e) => handleSettingChange('showProfile', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748' }}>
                            🔔 Notification Settings
                        </h2>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Ride Updates</span>
                                <input type="checkbox" checked={settings.rideUpdates} onChange={(e) => handleSettingChange('rideUpdates', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Promotional Offers</span>
                                <input type="checkbox" checked={settings.promotionalOffers} onChange={(e) => handleSettingChange('promotionalOffers', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Email Notifications</span>
                                <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <ChangePasswordModal 
                    isOpen={showPasswordModal} 
                    onClose={() => setShowPasswordModal(false)} 
                />
                
                <DriverApplicationModal 
                    isOpen={showDriverModal} 
                    onClose={() => setShowDriverModal(false)}
                    onSuccess={(status) => {
                        setDriverApplicationStatus(status);
                        setShowDriverModal(false);
                    }}
                />
            </div>
        </div>
    );
}