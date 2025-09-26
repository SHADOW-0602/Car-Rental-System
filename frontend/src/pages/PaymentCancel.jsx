import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
    const navigate = useNavigate();
    
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                textAlign: 'center',
                maxWidth: '400px'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                <h2 style={{ color: '#d97706', marginBottom: '10px' }}>Payment Cancelled</h2>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>
                    Your payment was cancelled. You can try again or choose a different payment method.
                </p>
                <button 
                    onClick={() => navigate('/user')}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px' }}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}