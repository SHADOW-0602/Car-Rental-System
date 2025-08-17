import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function AdminPortal() {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [analytics, setAnalytics] = useState({});

    useEffect(() => {
        loadUsers();
        loadDrivers();
        loadTrips();
        loadComplaints();
        loadAnalytics();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadDrivers = async () => {
        try {
            const response = await api.get('/admin/drivers');
            setDrivers(response.data);
        } catch (error) {
            console.error('Error loading drivers:', error);
        }
    };

    const loadTrips = async () => {
        try {
            const response = await api.get('/admin/trips');
            setTrips(response.data);
        } catch (error) {
            console.error('Error loading trips:', error);
        }
    };

    const loadComplaints = async () => {
        try {
            const response = await api.get('/admin/complaints');
            setComplaints(response.data);
        } catch (error) {
            console.error('Error loading complaints:', error);
        }
    };

    const loadAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics');
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}/status`, {
                status: currentStatus === 'active' ? 'suspended' : 'active'
            });
            loadUsers();
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    const resolveComplaint = async (complaintId) => {
        try {
            await api.put(`/admin/complaints/${complaintId}/resolve`);
            loadComplaints();
        } catch (error) {
            alert('Failed to resolve complaint');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar />
            
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>
                    👨💼 Admin Portal
                </h1>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'users', label: '👥 User Management' },
                        { id: 'drivers', label: '🚕 Driver Management' },
                        { id: 'trips', label: '🗺️ Trip Monitoring' },
                        { id: 'complaints', label: '📞 Complaints' },
                        { id: 'analytics', label: '📊 Analytics' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                borderRadius: '10px',
                                backgroundColor: activeTab === tab.id ? '#667eea' : 'white',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* User Management Tab */}
                {activeTab === 'users' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>User Account Management</h2>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc' }}>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Role</th>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>{user.name}</td>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>{user.email}</td>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    backgroundColor: user.role === 'admin' ? '#fef3c7' : '#dbeafe',
                                                    color: user.role === 'admin' ? '#d97706' : '#2563eb'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    backgroundColor: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                                                    color: user.status === 'active' ? '#16a34a' : '#dc2626'
                                                }}>
                                                    {user.status || 'active'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                                <button
                                                    onClick={() => toggleUserStatus(user._id, user.status || 'active')}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: user.status === 'active' ? '#ef4444' : '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Driver Management Tab */}
                {activeTab === 'drivers' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Driver Account Management</h2>
                        
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {drivers.map(driver => (
                                <div key={driver._id} style={{
                                    padding: '20px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0' }}>{driver.name}</h3>
                                            <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>
                                                {driver.email} • {driver.phone}
                                            </p>
                                            <p style={{ margin: 0, color: '#64748b' }}>
                                                Vehicle: {driver.vehicle?.make} {driver.vehicle?.model}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '15px',
                                                fontSize: '12px',
                                                backgroundColor: driver.available ? '#dcfce7' : '#fee2e2',
                                                color: driver.available ? '#16a34a' : '#dc2626'
                                            }}>
                                                {driver.available ? 'Available' : 'Offline'}
                                            </span>
                                            <button style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trip Monitoring Tab */}
                {activeTab === 'trips' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Trip Monitoring</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                                    {trips.filter(t => t.status === 'in_progress').length}
                                </div>
                                <div style={{ color: '#16a34a' }}>Active Trips</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                                    {trips.filter(t => t.status === 'completed').length}
                                </div>
                                <div style={{ color: '#d97706' }}>Completed Today</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                                    ₹{trips.reduce((sum, t) => sum + (t.fare || 0), 0)}
                                </div>
                                <div style={{ color: '#2563eb' }}>Total Revenue</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {trips.slice(0, 10).map(trip => (
                                <div key={trip._id} style={{
                                    padding: '20px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0' }}>
                                                {trip.pickup_location?.address} → {trip.drop_location?.address}
                                            </h3>
                                            <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>
                                                Driver: {trip.driver?.name} • Passenger: {trip.user?.name}
                                            </p>
                                            <p style={{ margin: 0, color: '#64748b' }}>
                                                {new Date(trip.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '15px',
                                                fontSize: '12px',
                                                backgroundColor: trip.status === 'completed' ? '#dcfce7' : 
                                                               trip.status === 'in_progress' ? '#fef3c7' : '#dbeafe',
                                                color: trip.status === 'completed' ? '#16a34a' : 
                                                       trip.status === 'in_progress' ? '#d97706' : '#2563eb'
                                            }}>
                                                {trip.status}
                                            </span>
                                            <div style={{ marginTop: '5px', fontWeight: '600' }}>
                                                ₹{trip.fare || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Complaints & Reports</h2>
                        
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {complaints.map(complaint => (
                                <div key={complaint._id} style={{
                                    padding: '20px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    backgroundColor: complaint.status === 'resolved' ? '#f0fdf4' : '#fef2f2'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 10px 0' }}>{complaint.subject}</h3>
                                            <p style={{ margin: '0 0 10px 0', color: '#64748b' }}>
                                                From: {complaint.user?.name} ({complaint.user?.email})
                                            </p>
                                            <p style={{ margin: '0 0 10px 0' }}>{complaint.description}</p>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                                {new Date(complaint.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{ marginLeft: '20px' }}>
                                            {complaint.status !== 'resolved' && (
                                                <button
                                                    onClick={() => resolveComplaint(complaint._id)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                            <span style={{
                                                display: 'block',
                                                marginTop: '10px',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                textAlign: 'center',
                                                backgroundColor: complaint.status === 'resolved' ? '#dcfce7' : '#fee2e2',
                                                color: complaint.status === 'resolved' ? '#16a34a' : '#dc2626'
                                            }}>
                                                {complaint.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>System Analytics & Logs</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a' }}>
                                    {analytics.totalUsers || 0}
                                </div>
                                <div style={{ color: '#16a34a' }}>Total Users</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#d97706' }}>
                                    {analytics.totalDrivers || 0}
                                </div>
                                <div style={{ color: '#d97706' }}>Active Drivers</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>
                                    {analytics.totalTrips || 0}
                                </div>
                                <div style={{ color: '#2563eb' }}>Total Trips</div>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#f3e8ff', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#9333ea' }}>
                                    ₹{analytics.totalRevenue || 0}
                                </div>
                                <div style={{ color: '#9333ea' }}>Total Revenue</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                            <div>
                                <h3>Recent Activity Logs</h3>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {[
                                        { time: '10:30 AM', action: 'New user registration', user: 'john@example.com' },
                                        { time: '10:25 AM', action: 'Trip completed', user: 'Driver #123' },
                                        { time: '10:20 AM', action: 'Payment processed', user: 'jane@example.com' },
                                        { time: '10:15 AM', action: 'Complaint resolved', user: 'Admin' }
                                    ].map((log, index) => (
                                        <div key={index} style={{
                                            padding: '10px',
                                            borderBottom: '1px solid #f1f5f9',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ color: '#64748b' }}>{log.time}</span> - {log.action} ({log.user})
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3>System Health</h3>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                        <span>Server Status</span>
                                        <span style={{ color: '#16a34a' }}>🟢 Online</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                        <span>Database</span>
                                        <span style={{ color: '#16a34a' }}>🟢 Connected</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                        <span>Payment Gateway</span>
                                        <span style={{ color: '#16a34a' }}>🟢 Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}