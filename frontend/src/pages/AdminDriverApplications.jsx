import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminDriverApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await api.get('/admin/driver-applications');
            if (response.data.success) {
                setApplications(response.data.applications);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveApplication = async (userId) => {
        try {
            const response = await api.post(`/admin/approve-driver/${userId}`);
            if (response.data.success) {
                alert('Driver application approved and user migrated to drivers database!');
                fetchApplications();
            }
        } catch (error) {
            console.error('Failed to approve application:', error);
            alert('Failed to approve application');
        }
    };

    const rejectApplication = async (userId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const response = await api.post(`/admin/reject-driver/${userId}`, { reason });
            if (response.data.success) {
                alert('Driver application rejected');
                fetchApplications();
            }
        } catch (error) {
            console.error('Failed to reject application:', error);
            alert('Failed to reject application');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Driver Applications</h1>
            
            {applications.length === 0 ? (
                <p>No driver applications found.</p>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {applications.map(app => (
                        <div key={app._id} style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            border: `2px solid ${
                                app.driverApplication.status === 'pending' ? '#f59e0b' :
                                app.driverApplication.status === 'approved' ? '#22c55e' : '#ef4444'
                            }`
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0' }}>{app.name}</h3>
                                    <p style={{ margin: '5px 0', color: '#64748b' }}>Email: {app.email}</p>
                                    <p style={{ margin: '5px 0', color: '#64748b' }}>
                                        Status: <span style={{ 
                                            fontWeight: '600',
                                            color: app.driverApplication.status === 'pending' ? '#d97706' :
                                                   app.driverApplication.status === 'approved' ? '#16a34a' : '#dc2626'
                                        }}>
                                            {app.driverApplication.status.toUpperCase()}
                                        </span>
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#64748b' }}>
                                        Applied: {new Date(app.driverApplication.appliedAt).toLocaleDateString()}
                                    </p>
                                    
                                    <div style={{ marginTop: '15px' }}>
                                        <h4 style={{ margin: '0 0 10px 0' }}>Application Details:</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px' }}>
                                            <div>
                                                <strong>License:</strong> {app.driverApplication.licenseNumber}
                                            </div>
                                            <div>
                                                <strong>Vehicle:</strong> {app.driverApplication.vehicleType} - {app.driverApplication.vehicleMake} {app.driverApplication.vehicleModel}
                                            </div>
                                            <div>
                                                <strong>Experience:</strong> {app.driverApplication.drivingExperience}
                                            </div>
                                            <div>
                                                <strong>Registration:</strong> {app.driverApplication.registrationNumber}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {app.driverApplication.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => approveApplication(app._id)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#22c55e',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ✅ Approve & Migrate
                                        </button>
                                        <button
                                            onClick={() => rejectApplication(app._id)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}