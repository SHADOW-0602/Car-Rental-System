import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import TwoFactorAuth from '../components/TwoFactorAuth';
import DeleteAccount from '../components/DeleteAccount';
import api from '../services/api';

export default function DriverSettings() {
    const { user } = useAuthContext();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [verificationDocuments, setVerificationDocuments] = useState({});
    const [settings, setSettings] = useState({
        shareLocation: true,
        marketingEmails: false,
        showProfile: true,
        rideUpdates: true,
        promotionalOffers: false,
        emailNotifications: true,
        // Driver-specific settings
        autoAcceptRides: false,
        rideNotifications: true,
        earningsReport: true,
        shareLocationWithPassengers: true
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
        
        loadSettings();
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
    
    const handleDocumentUpload = (type, file) => {
        if (file) {
            setVerificationDocuments(prev => ({ ...prev, [type]: file }));
        }
    };
    
    const hasDocuments = () => {
        return Object.keys(verificationDocuments).length > 0;
    };
    
    const submitVerificationDocuments = async () => {
        try {
            const formData = new FormData();
            Object.keys(verificationDocuments).forEach(key => {
                formData.append(key, verificationDocuments[key]);
            });
            
            await api.post('/users/submit-verification', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('Verification documents submitted successfully!');
            setVerificationDocuments({});
        } catch (error) {
            alert('Failed to submit verification documents');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
                    ⚙️ Driver Settings
                </h1>
                <div style={{ display: 'grid', gap: '25px' }}>
                    
                    {/* Driver-specific settings */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        border: '2px solid #22c55e'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            🚕 Driver Settings
                        </h2>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Auto Accept Rides</span>
                                <input type="checkbox" checked={settings.autoAcceptRides} onChange={(e) => handleSettingChange('autoAcceptRides', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Ride Request Notifications</span>
                                <input type="checkbox" checked={settings.rideNotifications} onChange={(e) => handleSettingChange('rideNotifications', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Weekly Earnings Report</span>
                                <input type="checkbox" checked={settings.earningsReport} onChange={(e) => handleSettingChange('earningsReport', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <span>Share Location with Passengers</span>
                                <input type="checkbox" checked={settings.shareLocationWithPassengers} onChange={(e) => handleSettingChange('shareLocationWithPassengers', e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Driver Verification Documents */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        border: user?.driverInfo?.isVerified ? '2px solid #22c55e' : '2px solid #f59e0b'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            📋 Verification Documents
                            {user?.driverInfo?.isVerified && (
                                <span style={{
                                    padding: '4px 12px',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    ✅ APPROVED
                                </span>
                            )}
                        </h2>
                        {user?.driverInfo?.isVerified ? (
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '10px',
                                border: '2px solid #22c55e',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
                                <h3 style={{ color: '#16a34a', marginBottom: '10px' }}>Verification Complete!</h3>
                                <p style={{ color: '#16a34a', margin: 0 }}>
                                    Your documents have been approved by our admin team. You can now accept rides and start earning!
                                </p>
                            </div>
                        ) : (
                            <>
                                <p style={{ color: '#64748b', marginBottom: '20px' }}>
                                    Upload your verification documents to get verified and start earning more.
                                </p>
                        
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>📄 Driver's License</h3>
                                <input 
                                    type="file" 
                                    accept="image/*,.pdf" 
                                    onChange={(e) => handleDocumentUpload('license', e.target.files[0])}
                                    style={{ marginBottom: '10px' }}
                                />
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Upload a clear photo of your driver's license</p>
                            </div>
                            
                            <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>🚗 Vehicle Registration</h3>
                                <input 
                                    type="file" 
                                    accept="image/*,.pdf" 
                                    onChange={(e) => handleDocumentUpload('registration', e.target.files[0])}
                                    style={{ marginBottom: '10px' }}
                                />
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Upload vehicle registration certificate</p>
                            </div>
                            
                            <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>🛡️ Insurance Certificate</h3>
                                <input 
                                    type="file" 
                                    accept="image/*,.pdf" 
                                    onChange={(e) => handleDocumentUpload('insurance', e.target.files[0])}
                                    style={{ marginBottom: '10px' }}
                                />
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Upload valid insurance certificate</p>
                            </div>
                            
                            <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>📸 Profile Photo</h3>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleDocumentUpload('photo', e.target.files[0])}
                                    style={{ marginBottom: '10px' }}
                                />
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Upload a clear profile photo</p>
                            </div>
                        </div>
                        
                                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                    <button
                                        onClick={submitVerificationDocuments}
                                        disabled={!hasDocuments()}
                                        style={{
                                            padding: '15px 30px',
                                            backgroundColor: hasDocuments() ? '#f59e0b' : '#94a3b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: hasDocuments() ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        📤 Submit for Verification
                                    </button>
                                </div>
                            </>
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
            </div>
        </div>
    );
}