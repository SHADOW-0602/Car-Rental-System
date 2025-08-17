import React, { useState, useEffect } from 'react';

export default function NotificationToast({ notification, onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            zIndex: 10000,
            minWidth: '300px',
            transform: visible ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#2d3748', fontSize: '16px' }}>
                        🔔 {notification.title}
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {notification.body}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        color: '#64748b',
                        marginLeft: '15px'
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
}