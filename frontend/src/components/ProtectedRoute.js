import React from 'react';
import { useAuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user } = useAuthContext();

    if (!user) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                flexDirection: 'column'
            }}>
                <h2>🔒 Access Denied</h2>
                <p>Please log in to access this page.</p>
                <a href="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
                    Go to Login
                </a>
            </div>
        );
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                flexDirection: 'column'
            }}>
                <h2>⛔ Access Denied</h2>
                <p>You don't have permission to access this page.</p>
                <p>Required role: {allowedRoles.join(' or ')}</p>
                <p>Your role: {user.role}</p>
            </div>
        );
    }

    return children;
}