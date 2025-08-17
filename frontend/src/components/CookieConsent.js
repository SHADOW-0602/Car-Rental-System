import React, { useState, useEffect } from 'react';
import CookieManager from '../utils/cookieManager';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        const consent = CookieManager.getCookie('cookieConsent');
        if (!consent) {
            setShowConsent(true);
        }
    }, []);

    const handleAccept = () => {
        CookieManager.setCookie('cookieConsent', 'true', 365);
        setShowConsent(false);
    };

    const handleDecline = () => {
        CookieManager.setCookie('cookieConsent', 'false', 365);
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            padding: '20px',
            zIndex: 10000,
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                        🍪 We use cookies to enhance your experience
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                        We'd like to store your login session for 1 week to keep you signed in. 
                        This helps provide a better user experience.
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={handleDecline}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        Accept & Continue
                    </button>
                </div>
            </div>
        </div>
    );
}