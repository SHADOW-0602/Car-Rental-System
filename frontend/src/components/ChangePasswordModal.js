import React, { useState } from 'react';
import api from '../services/api';

export default function ChangePasswordModal({ isOpen, onClose }) {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage('❌ New passwords do not match');
            return;
        }
        
        setLoading(true);
        try {
            await api.put('/users/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setMessage('✅ Password changed successfully!');
            setTimeout(() => {
                onClose();
                setPasswords({ current: '', new: '', confirm: '' });
                setMessage('');
            }, 1500);
        } catch (error) {
            setMessage('❌ Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '15px',
                width: '400px',
                maxWidth: '90vw'
            }}>
                <h3 style={{ marginBottom: '20px' }}>🔐 Change Password</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        required
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        required
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        required
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    {message && <p style={{ color: message.includes('✅') ? 'green' : 'red', fontSize: '14px' }}>{message}</p>}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}