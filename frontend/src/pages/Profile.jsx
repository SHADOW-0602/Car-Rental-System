import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';
import CookieManager from '../utils/cookieManager';
import api from '../services/api';

export default function Profile() {
    const { user } = useAuthContext();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Prefill form with current user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.location?.address || ''
            });
            setProfilePhoto(user.profile_image || null);
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Compress image before upload
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Resize to max 150x150 for smaller payload
                const maxSize = 150;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with higher compression
                const compressedImage = canvas.toDataURL('image/jpeg', 0.5);
                setProfilePhoto(compressedImage);
            };
            
            img.src = URL.createObjectURL(file);
        }
    };

    const removePhoto = () => setProfilePhoto(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                profile_image: profilePhoto,
                location: { address: formData.address }
            };

            const response = await api.put('/users/profile', updateData);
            const updatedUser = { ...user, ...response.data.user };
            
            // Update session storage
            CookieManager.setUserSession(CookieManager.getUserSession().token, updatedUser);
            
            setMessage('✅ Profile updated successfully!');
            
            // Refresh page to update navbar
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setMessage('❌ Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
                    👤 Update Profile
                </h1>
                
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Profile Photo Section */}
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                margin: '0 auto 20px',
                                background: profilePhoto 
                                    ? `url(${profilePhoto}) center/cover` 
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '48px',
                                color: 'white',
                                fontWeight: 'bold',
                                border: '4px solid #e2e8f0'
                            }}>
                                {!profilePhoto && (user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <label style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}>
                                    📷 Upload Photo
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                </label>
                                
                                {profilePhoto && (
                                    <button type="button" onClick={removePhoto} style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#e53e3e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}>
                                        🗑️ Remove
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1234567890"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter your address"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>

                        {message && (
                            <div style={{
                                marginTop: '20px',
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: message.includes('✅') ? '#f0fff4' : '#fed7d7',
                                color: message.includes('✅') ? '#22543d' : '#c53030',
                                border: `1px solid ${message.includes('✅') ? '#9ae6b4' : '#feb2b2'}`
                            }}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                marginTop: '30px',
                                padding: '15px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? '🔄 Updating...' : '💾 Update Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}