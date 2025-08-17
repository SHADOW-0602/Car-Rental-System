import React, { useState } from 'react';
import api from '../services/api';

export default function ReportIssueModal({ isOpen, onClose }) {
    const [issue, setIssue] = useState({
        type: 'technical',
        subject: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/support/report-issue', issue);
            setMessage('✅ Issue reported successfully! We\'ll get back to you soon.');
            setTimeout(() => {
                onClose();
                setIssue({ type: 'technical', subject: '', description: '' });
                setMessage('');
            }, 2000);
        } catch (error) {
            setMessage('❌ Failed to report issue. Please try again.');
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
                width: '500px',
                maxWidth: '90vw'
            }}>
                <h3 style={{ marginBottom: '20px' }}>📝 Report an Issue</h3>
                <form onSubmit={handleSubmit}>
                    <select
                        value={issue.type}
                        onChange={(e) => setIssue({...issue, type: e.target.value})}
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                    >
                        <option value="technical">Technical Issue</option>
                        <option value="payment">Payment Problem</option>
                        <option value="driver">Driver Issue</option>
                        <option value="booking">Booking Problem</option>
                        <option value="other">Other</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Subject"
                        value={issue.subject}
                        onChange={(e) => setIssue({...issue, subject: e.target.value})}
                        required
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <textarea
                        placeholder="Describe the issue in detail..."
                        value={issue.description}
                        onChange={(e) => setIssue({...issue, description: e.target.value})}
                        required
                        rows={4}
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical' }}
                    />
                    {message && <p style={{ color: message.includes('✅') ? 'green' : 'red', fontSize: '14px' }}>{message}</p>}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}