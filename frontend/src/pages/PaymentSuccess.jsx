import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    
    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            verifyStripePayment(sessionId);
        } else {
            setStatus('error');
        }
    }, [searchParams]);
    
    const verifyStripePayment = async (sessionId) => {
        try {
            // Find payment by session ID and verify
            const response = await api.post('/payments/verify-stripe-session', {
                session_id: sessionId
            });
            
            if (response.data.success) {
                setStatus('success');
                setTimeout(() => navigate('/user'), 3000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
            setStatus('error');
        }
    };
    
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
                {status === 'verifying' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                        <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>Verifying Payment...</h2>
                        <p style={{ color: '#64748b' }}>Please wait while we confirm your payment.</p>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ color: '#16a34a', marginBottom: '10px' }}>Payment Successful!</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>
                            Your payment has been processed successfully. You will be redirected to your dashboard.
                        </p>
                        <button 
                            onClick={() => navigate('/user')}
                            className="btn btn-primary"
                            style={{ padding: '12px 24px' }}
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                        <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Payment Failed</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>
                            There was an issue processing your payment. Please try again.
                        </p>
                        <button 
                            onClick={() => navigate('/user')}
                            className="btn btn-primary"
                            style={{ padding: '12px 24px' }}
                        >
                            Back to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}