import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function DeleteAccount() {
    const { user, logout } = useAuthContext();
    const [password, setPassword] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!password) {
            alert('Please enter your password');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/delete-account', { password });
            alert('Account deleted successfully');
            logout();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    if (!showConfirm) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 15px 0' }}>⚠️ Delete Account</h3>
                <p style={{ marginBottom: '15px', color: '#7f1d1d' }}>
                    This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                    onClick={() => setShowConfirm(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Delete Account
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <h3 style={{ color: '#dc2626', margin: '0 0 15px 0' }}>⚠️ Confirm Account Deletion</h3>
            <p style={{ marginBottom: '15px', color: '#7f1d1d' }}>
                Enter your password to confirm deletion of your account and all data.
            </p>
            <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '15px',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px'
                }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}