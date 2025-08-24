import React from 'react';

export default function VerifiedBadge({ isVerified, size = 'small' }) {
    if (!isVerified) return null;
    
    const sizes = {
        small: { width: '16px', height: '16px', marginLeft: '5px' },
        medium: { width: '20px', height: '20px', marginLeft: '8px' },
        large: { width: '24px', height: '24px', marginLeft: '10px' }
    };
    
    return (
        <img 
            src="/assets/Verification_Badge.png"
            alt="Verified Driver"
            title="Verified Driver"
            style={{
                ...sizes[size],
                display: 'inline-block',
                verticalAlign: 'middle'
            }}
        />
    );
}