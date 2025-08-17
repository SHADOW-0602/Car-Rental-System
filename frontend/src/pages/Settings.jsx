import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import api from '../services/api';

export default function Settings() {
    const { user } = useAuthContext();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [settings, setSettings] = useState({
        shareLocation: true,
        marketingEmails: false,
        showProfile: true,
        rideUpdates: true,
        promotionalOffers: false,
        smsNotifications: true
    });

    const handleSettingChange = async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        try {
            await api.put('/users/settings', { [key]: value });
        } catch (error) {
            console.error('Failed to update setting:', error);
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion feature will be implemented soon.');
        }
    };

    const handleEnableTwoFactor = () => {
        alert('Two-factor authentication setup will be implemented soon.');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
                    ⚙️ Settings
                </h1>
                <div style={{ display: 'grid', gap: '25px' }}>
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
                                <span>Two-Factor Authentication</span>
                                <button onClick={handleEnableTwoFactor} style={{ padding: '8px 16px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Enable</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Delete Account</span>
                                <button onClick={handleDeleteAccount} style={{ padding: '8px 16px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                            </div>
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
                                <span>SMS Notifications</span>
                                <input type="checkbox" checked={settings.smsNotifications} onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <ChangePasswordModal 
                    isOpen={showPasswordModal} 
                    onClose={() => setShowPasswordModal(false)} 
                />
            </div>
        </div>
    );
}