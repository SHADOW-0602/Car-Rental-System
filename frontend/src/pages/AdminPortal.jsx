import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AdminAnalytics from '../components/AdminAnalytics';
import LiveMonitoring from '../components/LiveMonitoring';
import { Button, Card, Badge, Layout } from '../components/ui';
import { theme } from '../styles/theme';
import api from '../services/api';
import io from 'socket.io-client';

export default function AdminPortal() {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [verificationRequests, setVerificationRequests] = useState([]);
    const [socket, setSocket] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [contactMessages, setContactMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [activeTrips, setActiveTrips] = useState([]);
    const [systemStats, setSystemStats] = useState({
        totalRides: 0,
        todayRides: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        averageRating: 0,
        completionRate: 0
    });

    useEffect(() => {
        loadUsers();
        loadDrivers();
        loadTrips();
        loadComplaints();
        loadAnalytics();
        loadVerificationRequests();
        loadContactMessages();
        loadActiveTrips();
        loadSystemStats();
        
        const newSocket = io('http://localhost:5000');
        
        newSocket.on('connect', () => {
            console.log('Admin connected to server');
            // Join admin room for admin-specific updates
            newSocket.emit('joinAdminRoom');
        });
        

        
        // Listen for driver location updates
        newSocket.on('driverLocationUpdate', (locationData) => {
            console.log('Received driver location update:', locationData);
            // Update driver location in state if viewing driver details
            if (selectedDriver && selectedDriver._id === locationData.driverId) {
                setSelectedDriver(prev => ({
                    ...prev,
                    location: {
                        latitude: locationData.latitude,
                        longitude: locationData.longitude,
                        address: locationData.address,
                        updatedAt: new Date()
                    }
                }));
            }
            // Refresh drivers list to show updated locations
            loadDrivers();
        });
        
        // Listen for admin notifications
        newSocket.on('admin_notification', (notification) => {
            console.log('Admin notification:', notification);
            if (notification.type === 'trip_started' || notification.type === 'ride_accepted') {
                loadActiveTrips();
            }
        });
        
        setSocket(newSocket);
        
        return () => {
            newSocket.disconnect();
        };
    }, [selectedDriver]);

    const loadUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers([]);
        }
    };

    const loadDrivers = async () => {
        try {
            const response = await api.get('/admin/drivers');
            const driversData = response.data.drivers || [];
            console.log('Frontend - Loaded drivers:', driversData.map(d => ({ id: d._id, name: d.name, status: d.status })));
            setDrivers(driversData);
        } catch (error) {
            console.error('Error loading drivers:', error);
            setDrivers([]);
        }
    };

    const loadTrips = async () => {
        try {
            const response = await api.get('/admin/trips');
            setTrips(response.data.trips || []);
        } catch (error) {
            console.error('Error loading trips:', error);
            setTrips([]);
        }
    };

    const loadComplaints = async () => {
        try {
            const response = await api.get('/admin/complaints');
            setComplaints(response.data.complaints || []);
        } catch (error) {
            console.error('Error loading complaints:', error);
            setComplaints([]);
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

    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const resolveComplaint = async (complaintId) => {
        try {
            await api.put(`/admin/complaints/${complaintId}/resolve`);
            alert('Complaint marked as resolved');
            loadComplaints();
        } catch (error) {
            alert('Failed to resolve complaint');
        }
    };


    
    const loadVerificationRequests = async () => {
        try {
            const response = await api.get('/admin/verification-requests');
            setVerificationRequests(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading verification requests:', error);
            setVerificationRequests([]);
        }
    };
    
    const loadContactMessages = async () => {
        try {
            const response = await api.get('/admin/contact-messages');
            setContactMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error loading contact messages:', error);
            setContactMessages([]);
        }
    };
    
    const loadActiveTrips = async () => {
        try {
            const response = await api.get('/rides/active-trips');
            setActiveTrips(response.data.trips || []);
        } catch (error) {
            console.error('Error loading active trips:', error);
            setActiveTrips([]);
        }
    };
    
    const loadSystemStats = async () => {
        try {
            const response = await api.get('/admin/system-stats');
            if (response.data.success) {
                setSystemStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error loading system stats:', error);
        }
    };
    
    const approveVerification = async (driverId) => {
        try {
            await api.put(`/admin/verification/${driverId}/approve`);
            loadVerificationRequests();
            loadDrivers();
            // If viewing driver details, refresh the selected driver
            if (selectedDriver && selectedDriver._id === driverId) {
                const response = await api.get(`/admin/drivers/${driverId}`);
                if (response.data.success) {
                    setSelectedDriver(response.data.driver);
                }
            }
            alert('Driver verification approved successfully!');
        } catch (error) {
            alert('Failed to approve verification');
        }
    };
    
    const rejectVerification = async (driverId) => {
        try {
            console.log('Rejecting verification for driver:', driverId);
            const response = await api.put(`/admin/verification/${driverId}/reject`);
            console.log('Reject response:', response.data);
            
            // Reload data
            await loadVerificationRequests();
            await loadDrivers();
            
            // If viewing driver details, refresh the selected driver
            if (selectedDriver && selectedDriver._id === driverId) {
                try {
                    const driverResponse = await api.get(`/admin/drivers`);
                    const updatedDriver = driverResponse.data.drivers?.find(d => d._id === driverId);
                    if (updatedDriver) {
                        setSelectedDriver(updatedDriver);
                    }
                } catch (driverError) {
                    console.log('Could not refresh driver details:', driverError.message);
                }
            }
            
            alert('Driver verification rejected successfully!');
        } catch (error) {
            console.error('Error rejecting verification:', error);
            alert('Failed to reject verification: ' + (error.response?.data?.error || error.message));
        }
    };



    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY`);
            const data = await response.json();
            return data.results[0]?.formatted || 'Unknown Location';
        } catch (error) {
            // Fallback to a simpler approach
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await response.json();
                return data.display_name?.split(',').slice(0, 3).join(', ') || 'Unknown Location';
            } catch (fallbackError) {
                return 'Unknown Location';
            }
        }
    };

    const viewDriverDetails = async (driver) => {
        setSelectedDriver(driver);
        setShowDriverModal(true);
        
        // Load real-time location data
        try {
            const response = await api.get(`/admin/drivers/${driver._id}/location`);
            if (response.data.success) {
                const location = response.data.location;
                // Convert coordinates to address if not already present
                if (location.latitude && location.longitude && !location.address) {
                    const address = await reverseGeocode(location.latitude, location.longitude);
                    location.address = address;
                }
                setSelectedDriver(prev => ({
                    ...prev,
                    location: location
                }));
            }
        } catch (error) {
            console.log('Could not load real-time location:', error.message);
        }
    };

    const toggleDriverStatus = async (driverId, currentStatus) => {
        try {
            if (!driverId) {
                alert('Invalid driver ID');
                return;
            }
            
            const newStatus = currentStatus === 'available' ? 'suspended' : 'available';
            console.log('Frontend - Updating driver status:', { 
                driverId, 
                driverIdType: typeof driverId,
                currentStatus, 
                newStatus,
                url: `/admin/drivers/${driverId}/status`
            });
            
            const response = await api.put(`/admin/drivers/${driverId}/status`, { status: newStatus });
            
            if (response.data.success) {
                alert(`Driver status updated to ${newStatus}`);
                loadDrivers();
                if (selectedDriver && selectedDriver._id === driverId) {
                    setSelectedDriver({ ...selectedDriver, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Frontend - Error updating driver status:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                driverId
            });
            if (error.response?.status === 404) {
                alert('Driver not found. The driver may have been deleted.');
                loadDrivers();
            } else {
                alert('Failed to update driver status: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    return (
        <div className="admin-portal">
            <Navbar user={user} />
            
            <div className="admin-container">
                <div className="admin-header">
                    <h1 className="admin-title">
                        🚕 UrbanFleet Admin
                    </h1>
                    <div className="admin-status">
                        <div className="status-online">
                            🟢 System Online
                        </div>
                        <div className="status-time">
                            {new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
                
                {/* Real-time Stats Dashboard */}
                <div className="stats-grid">
                    <div className="stat-card active-trips">
                        <div className="stat-header">
                            <div className="stat-icon">🚗</div>
                            <div className="stat-label">ACTIVE TRIPS</div>
                        </div>
                        <div className="stat-value green">{activeTrips.length}</div>
                        <div className="stat-description">Live monitoring</div>
                    </div>
                    
                    <div className="stat-card total-users">
                        <div className="stat-header">
                            <div className="stat-icon">👥</div>
                            <div className="stat-label">TOTAL USERS</div>
                        </div>
                        <div className="stat-value blue">{users.length}</div>
                        <div className="stat-description">Registered accounts</div>
                    </div>
                    
                    <div className="stat-card active-drivers">
                        <div className="stat-header">
                            <div className="stat-icon">🚕</div>
                            <div className="stat-label">ONLINE DRIVERS</div>
                        </div>
                        <div className="stat-value orange">{drivers.filter(d => d.status === 'available').length}</div>
                        <div className="stat-description">Available now</div>
                    </div>
                    
                    <div className="stat-card pending-verifications">
                        <div className="stat-header">
                            <div className="stat-icon">📋</div>
                            <div className="stat-label">PENDING VERIFICATIONS</div>
                        </div>
                        <div className="stat-value red">{verificationRequests.length}</div>
                        <div className="stat-description">Awaiting approval</div>
                    </div>
                    
                    <div className="stat-card total-rides">
                        <div className="stat-header">
                            <div className="stat-icon">📊</div>
                            <div className="stat-label">TODAY'S RIDES</div>
                        </div>
                        <div className="stat-value purple">{systemStats.todayRides}</div>
                        <div className="stat-description">Completed today</div>
                    </div>
                    
                    <div className="stat-card revenue">
                        <div className="stat-header">
                            <div className="stat-icon">💰</div>
                            <div className="stat-label">TODAY'S REVENUE</div>
                        </div>
                        <div className="stat-value green">₹{systemStats.todayRevenue}</div>
                        <div className="stat-description">Earnings today</div>
                    </div>
                    
                    <div className="stat-card rating">
                        <div className="stat-header">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-label">AVERAGE RATING</div>
                        </div>
                        <div className="stat-value yellow">{systemStats.averageRating}/5</div>
                        <div className="stat-description">Platform rating</div>
                    </div>
                    
                    <div className="stat-card completion">
                        <div className="stat-header">
                            <div className="stat-icon">✅</div>
                            <div className="stat-label">COMPLETION RATE</div>
                        </div>
                        <div className="stat-value blue">{systemStats.completionRate}%</div>
                        <div className="stat-description">Success rate</div>
                    </div>
                </div>

                <div className="admin-nav">
                    {[
                        { id: 'trips', label: '🗺️ Live Monitoring', priority: true },
                        { id: 'drivers', label: '🚕 Drivers', count: drivers.length },
                        { id: 'users', label: '👥 Users', count: users.length },
                        { id: 'verification', label: '📋 Verifications', count: verificationRequests.length, alert: verificationRequests.length > 0 },
                        { id: 'complaints', label: '📞 Support', count: complaints.filter(c => c.status !== 'resolved').length },
                        { id: 'contact', label: '📧 Messages', count: contactMessages.filter(m => !m.reply).length },
                        { id: 'analytics', label: '📊 Analytics' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`nav-tab ${activeTab === tab.id ? 'active' : ''} ${tab.priority ? 'priority' : ''}`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`nav-badge ${tab.alert ? 'alert' : ''}`}>
                                    {tab.count > 99 ? '99+' : tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {activeTab === 'users' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>User Account Management</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>Total Users: {users.length}</span>
                                <button 
                                    onClick={loadUsers}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>
                        
                        {users.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
                                <p>No users found in the system</p>
                                <p style={{ fontSize: '14px' }}>Users will appear here once they register</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {users.map(user => (
                                    <div key={user._id} style={{
                                        padding: '20px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        backgroundColor: '#fafafa'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {user.name}
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '10px',
                                                        backgroundColor: user.role === 'admin' ? '#fef3c7' : '#dbeafe',
                                                        color: user.role === 'admin' ? '#d97706' : '#2563eb',
                                                        fontWeight: '600'
                                                    }}>
                                                        {user.role?.toUpperCase() || 'USER'}
                                                    </span>
                                                    {user.twoFactorEnabled && (
                                                        <span style={{
                                                            padding: '2px 6px',
                                                            backgroundColor: '#22c55e',
                                                            color: 'white',
                                                            borderRadius: '12px',
                                                            fontSize: '10px',
                                                            fontWeight: '600'
                                                        }}>🔐 2FA</span>
                                                    )}
                                                </h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                                                    <div><strong>Email:</strong> {user.email}</div>
                                                    <div><strong>Phone:</strong> {user.phone || 'Not provided'}</div>
                                                    <div><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
                                                    <div><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                                                    <div><strong>Total Rides:</strong> {user.totalRides || 0}</div>
                                                    <div><strong>Total Spent:</strong> ₹{user.totalSpent || 0}</div>
                                                    <div><strong>Account Age:</strong> {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'end' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '15px',
                                                    fontSize: '12px',
                                                    backgroundColor: (user.status || 'active') === 'active' ? '#dcfce7' : '#fee2e2',
                                                    color: (user.status || 'active') === 'active' ? '#16a34a' : '#dc2626',
                                                    fontWeight: '600'
                                                }}>
                                                    {(user.status || 'active').toUpperCase()}
                                                </span>
                                                <button
                                                    onClick={() => viewUserDetails(user)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#667eea',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    📋 Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'drivers' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Driver Account Management</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>Total Drivers: {drivers.length}</span>
                                <button 
                                    onClick={loadDrivers}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>
                        
                        {drivers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚕</div>
                                <p>No drivers found in the system</p>
                                <p style={{ fontSize: '14px' }}>Drivers will appear here once they register and are approved</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {drivers.map(driver => (
                                    <div key={driver._id} style={{
                                        padding: '20px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {driver.name}
                                                    {driver.driverInfo?.isVerified && (
                                                        <span style={{
                                                            padding: '2px 6px',
                                                            backgroundColor: '#22c55e',
                                                            color: 'white',
                                                            borderRadius: '12px',
                                                            fontSize: '10px',
                                                            fontWeight: '600'
                                                        }}>✓ VERIFIED</span>
                                                    )}
                                                </h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                                                    <div><strong>Email:</strong> {driver.email}</div>
                                                    <div><strong>Phone:</strong> {driver.phone}</div>
                                                    <div><strong>Registered:</strong> {new Date(driver.createdAt).toLocaleString()}</div>
                                                    <div><strong>Experience:</strong> {driver.driverInfo?.drivingExperience || 'N/A'}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                                                    <div><strong>Rating:</strong> {driver.rating || 0}/5 ⭐</div>
                                                    <div><strong>Completed Rides:</strong> {driver.completedRides || 0}</div>
                                                    <div><strong>Total Earnings:</strong> ₹{driver.earnings?.total || 0}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'end' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '15px',
                                                    fontSize: '12px',
                                                    backgroundColor: driver.status === 'available' ? '#dcfce7' : 
                                                                   driver.status === 'busy' ? '#fef3c7' : '#fee2e2',
                                                    color: driver.status === 'available' ? '#16a34a' : 
                                                           driver.status === 'busy' ? '#d97706' : '#dc2626'
                                                }}>
                                                    {driver.status || 'offline'}
                                                </span>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => viewDriverDetails(driver)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#667eea',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        📋 Details
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleDriverStatus(driver._id, driver.status)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: driver.status === 'available' ? '#ef4444' : '#22c55e',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        {driver.status === 'available' ? '🚫 Suspend' : '✅ Activate'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'verification' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Driver Verification Requests</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>Pending Requests: {verificationRequests.length}</span>
                                <button 
                                    onClick={loadVerificationRequests}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>
                        
                        {verificationRequests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                                <p>No verification requests pending</p>
                                <p style={{ fontSize: '14px' }}>Driver verification requests will appear here</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {verificationRequests.map(request => (
                                    <div key={request._id} style={{
                                        padding: '25px',
                                        border: '2px solid #f59e0b',
                                        borderRadius: '12px',
                                        backgroundColor: '#fffbeb'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {request.name}
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#f59e0b',
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        PENDING VERIFICATION
                                                    </span>
                                                </h3>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                                    <div>
                                                        <strong>Email:</strong> {request.email}
                                                    </div>
                                                    <div>
                                                        <strong>Phone:</strong> {request.phone}
                                                    </div>
                                                    <div>
                                                        <strong>License:</strong> {request.driverInfo?.licenseNumber || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>Vehicle:</strong> {request.driverInfo?.vehicleType || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>Registration:</strong> {request.driverInfo?.registrationNumber || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>Experience:</strong> {request.driverInfo?.drivingExperience || 'N/A'}
                                                    </div>
                                                </div>

                                                {/* Documents Section */}
                                                <div style={{ marginTop: '20px' }}>
                                                    <h4 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Uploaded Documents:</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                                        {[
                                                            { key: 'licensePhoto', label: '📄 License Photo', file: request.driverInfo?.documents?.licensePhoto },
                                                            { key: 'vehicleRC', label: '🚗 Vehicle Registration', file: request.driverInfo?.documents?.vehicleRC },
                                                            { key: 'insurance', label: '🛡️ Insurance', file: request.driverInfo?.documents?.insurance },
                                                            { key: 'profilePhoto', label: '📸 Profile Photo', file: request.driverInfo?.documents?.profilePhoto }
                                                        ].map(doc => (
                                                            <div key={doc.key} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>{doc.label}</div>
                                                                {doc.file ? (
                                                                    <a 
                                                                        href={`${window.location.protocol}//${window.location.hostname}:5000/uploads/verification/${doc.file}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{
                                                                            display: 'inline-block',
                                                                            padding: '6px 12px',
                                                                            backgroundColor: '#3b82f6',
                                                                            color: 'white',
                                                                            textDecoration: 'none',
                                                                            borderRadius: '6px',
                                                                            fontSize: '12px'
                                                                        }}
                                                                    >
                                                                        👁️ View Document
                                                                    </a>
                                                                ) : (
                                                                    <span style={{
                                                                        display: 'inline-block',
                                                                        padding: '6px 12px',
                                                                        backgroundColor: '#f3f4f6',
                                                                        color: '#6b7280',
                                                                        borderRadius: '6px',
                                                                        fontSize: '12px'
                                                                    }}>
                                                                        ❌ Not Uploaded
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <button
                                                    onClick={() => approveVerification(request._id)}
                                                    style={{
                                                        padding: '12px 20px',
                                                        backgroundColor: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    ✅ Approve Verification
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to reject verification for ${request.name}?`)) {
                                                            rejectVerification(request._id);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '12px 20px',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    ❌ Reject Verification
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}



                {activeTab === 'complaints' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Support Tickets & Complaints</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>Total Complaints: {complaints.length}</span>
                                <button 
                                    onClick={loadComplaints}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>
                        
                        {complaints.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📞</div>
                                <p>No complaints or support tickets found</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {complaints.map(complaint => (
                                    <div key={complaint._id} style={{
                                        padding: '20px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        backgroundColor: complaint.status === 'escalated' ? '#fef3c7' : 
                                                       complaint.status === 'in-progress' ? '#dbeafe' : 
                                                       complaint.status === 'resolved' ? '#dcfce7' : '#f8fafc'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {complaint.category?.toUpperCase()} Issue
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        backgroundColor: complaint.status === 'escalated' ? '#f59e0b' : 
                                                                       complaint.status === 'in-progress' ? '#3b82f6' : 
                                                                       complaint.status === 'resolved' ? '#22c55e' : '#64748b',
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        fontSize: '10px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {complaint.status?.toUpperCase()}
                                                    </span>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        backgroundColor: complaint.priority === 'urgent' ? '#ef4444' : 
                                                                       complaint.priority === 'high' ? '#f59e0b' : 
                                                                       complaint.priority === 'medium' ? '#3b82f6' : '#64748b',
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        fontSize: '10px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {complaint.priority?.toUpperCase()}
                                                    </span>
                                                </h3>
                                                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#64748b' }}>
                                                    <div><strong>From:</strong> {complaint.userName} ({complaint.userEmail})</div>
                                                    <div><strong>Date:</strong> {new Date(complaint.createdAt).toLocaleString()}</div>
                                                    <div><strong>Category:</strong> {complaint.category}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '10px' }}>
                                            <p style={{ margin: 0, lineHeight: '1.6' }}><strong>Issue:</strong> {complaint.issue}</p>
                                        </div>
                                        {complaint.messages && complaint.messages.length > 0 && (
                                            <div style={{ marginBottom: '10px' }}>
                                                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b' }}>Conversation:</h4>
                                                {complaint.messages.map((msg, index) => (
                                                    <div key={index} style={{
                                                        padding: '10px',
                                                        backgroundColor: msg.senderType === 'admin' ? '#f0f9ff' : '#f8fafc',
                                                        borderRadius: '6px',
                                                        marginBottom: '5px',
                                                        borderLeft: `3px solid ${msg.senderType === 'admin' ? '#3b82f6' : '#64748b'}`
                                                    }}>
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                                            <strong>{msg.senderType === 'admin' ? 'Admin' : msg.sender}</strong> - {new Date(msg.timestamp).toLocaleString()}
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {complaint.adminResponse && (
                                            <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #3b82f6' }}>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                                    <strong>Admin Response</strong>
                                                </div>
                                                <p style={{ margin: 0, lineHeight: '1.6', color: '#1e293b' }}>{complaint.adminResponse}</p>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            {complaint.status !== 'resolved' && (
                                                <button
                                                    onClick={() => resolveComplaint(complaint._id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    ✅ Mark Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Contact Messages</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>Total Messages: {contactMessages.length}</span>
                                <button 
                                    onClick={loadContactMessages}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        </div>
                        
                        {contactMessages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
                                <p>No contact messages received</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {contactMessages.map(message => (
                                    <div key={message._id} style={{
                                        padding: '20px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        backgroundColor: message.status === 'new' ? '#fef3c7' : '#f8fafc'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {message.subject}
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        backgroundColor: message.status === 'replied' ? '#22c55e' : message.status === 'new' ? '#f59e0b' : '#64748b',
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        fontSize: '10px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {message.status === 'replied' ? 'REPLIED' : message.status === 'new' ? 'NEW' : 'READ'}
                                                    </span>
                                                </h3>
                                                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#64748b' }}>
                                                    <div><strong>From:</strong> {message.name} ({message.email})</div>
                                                    <div><strong>Date:</strong> {new Date(message.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '10px' }}>
                                            <p style={{ margin: 0, lineHeight: '1.6' }}>{message.message}</p>
                                        </div>
                                        {message.reply && (
                                            <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #3b82f6' }}>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                                    <strong>Admin Reply</strong> - {new Date(message.reply.repliedAt).toLocaleString()}
                                                </div>
                                                <p style={{ margin: 0, lineHeight: '1.6', color: '#1e293b' }}>{message.reply.text}</p>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            {!message.reply ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedMessage(message);
                                                        setReplyText('');
                                                    }}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    📧 Send Reply
                                                </button>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <span style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#dcfce7',
                                                        color: '#16a34a',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        ✅ Reply Sent
                                                    </span>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Are you sure you want to delete this reply? This will allow you to send a new reply.')) {
                                                                try {
                                                                    await api.delete(`/admin/contact-messages/${message._id}/reply`);
                                                                    await loadContactMessages();
                                                                    alert('Reply deleted successfully!');
                                                                } catch (error) {
                                                                    alert('Failed to delete reply: ' + (error.response?.data?.error || error.message));
                                                                }
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        🗑️ Delete Reply
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Contact Message Reply Modal */}
                {selectedMessage && (
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
                            borderRadius: '15px',
                            padding: '30px',
                            maxWidth: '600px',
                            width: '90%'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>Reply to Contact Message</h2>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                        ⚠️ You can only send one reply per message. Reply will be sent via email.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedMessage(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</div>
                                <div><strong>Subject:</strong> {selectedMessage.subject}</div>
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
                                    {selectedMessage.message}
                                </div>
                            </div>

                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply here..."
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    marginBottom: '20px'
                                }}
                            />

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button 
                                    onClick={() => setSelectedMessage(null)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#64748b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={async () => {
                                        if (!replyText.trim()) {
                                            alert('Please enter a reply message.');
                                            return;
                                        }
                                        try {
                                            const response = await api.post(`/admin/contact-messages/${selectedMessage._id}/reply`, {
                                                replyText: replyText.trim()
                                            });
                                            // Close modal first
                                            setSelectedMessage(null);
                                            setReplyText('');
                                            // Then reload messages
                                            await loadContactMessages();
                                            alert(response.data.message || 'Reply sent successfully and email delivered!');
                                        } catch (error) {
                                            const errorMsg = error.response?.data?.error || 'Failed to send reply';
                                            alert(errorMsg);
                                            if (errorMsg.includes('already has a reply')) {
                                                // Close modal and refresh if reply already exists
                                                setSelectedMessage(null);
                                                setReplyText('');
                                                await loadContactMessages();
                                            }
                                        }
                                    }}
                                    disabled={!replyText.trim()}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: !replyText.trim() ? '#94a3b8' : '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: !replyText.trim() ? 'not-allowed' : 'pointer',
                                        opacity: !replyText.trim() ? 0.6 : 1
                                    }}
                                >
                                    📧 Send Reply & Email
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'trips' && (
                    <LiveMonitoring />
                )}

                {activeTab === 'analytics' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <AdminAnalytics />
                    </div>
                )}

                {showDriverModal && selectedDriver && (
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
                            borderRadius: '15px',
                            padding: '30px',
                            maxWidth: '800px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>Driver Details - {selectedDriver.name}</h2>
                                <button 
                                    onClick={() => setShowDriverModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#64748b'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Personal Information</h3>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div><strong>Name:</strong> {selectedDriver.name}</div>
                                        <div><strong>Email:</strong> {selectedDriver.email}</div>
                                        <div><strong>Phone:</strong> {selectedDriver.phone}</div>
                                        <div><strong>Status:</strong> 
                                            <span style={{
                                                marginLeft: '8px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                backgroundColor: selectedDriver.status === 'available' ? '#dcfce7' : '#fee2e2',
                                                color: selectedDriver.status === 'available' ? '#16a34a' : '#dc2626'
                                            }}>
                                                {selectedDriver.status || 'offline'}
                                            </span>
                                        </div>
                                        <div><strong>Joined:</strong> {new Date(selectedDriver.createdAt).toLocaleDateString()}</div>
                                        <div><strong>Verification Status:</strong> 
                                            <span style={{
                                                marginLeft: '8px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: selectedDriver.driverInfo?.isVerified ? '#dcfce7' : 
                                                               selectedDriver.verificationRequest?.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                                color: selectedDriver.driverInfo?.isVerified ? '#16a34a' : 
                                                       selectedDriver.verificationRequest?.status === 'pending' ? '#d97706' : '#dc2626'
                                            }}>
                                                {selectedDriver.driverInfo?.isVerified ? '✅ APPROVED' : 
                                                 selectedDriver.verificationRequest?.status === 'pending' ? '⏳ PENDING' : 
                                                 selectedDriver.verificationRequest?.status === 'rejected' ? '❌ REJECTED' : '📋 NOT SUBMITTED'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Driver Information</h3>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div><strong>License Number:</strong> {selectedDriver.driverInfo?.licenseNumber || 'N/A'}</div>
                                        <div><strong>Vehicle Type:</strong> {selectedDriver.driverInfo?.vehicleType || 'N/A'}</div>
                                        <div><strong>Experience:</strong> {selectedDriver.driverInfo?.drivingExperience || 'N/A'}</div>
                                        <div><strong>Documents:</strong> 
                                            <span style={{
                                                marginLeft: '8px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: selectedDriver.driverInfo?.isVerified ? '#dcfce7' : '#fef3c7',
                                                color: selectedDriver.driverInfo?.isVerified ? '#16a34a' : '#d97706'
                                            }}>
                                                {selectedDriver.driverInfo?.isVerified ? '📄 APPROVED' : '📋 PENDING REVIEW'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Performance</h3>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div><strong>Rating:</strong> {selectedDriver.rating || 0}/5 ⭐</div>
                                        <div><strong>Completed Rides:</strong> {selectedDriver.completedRides || 0}</div>
                                        <div><strong>Total Earnings:</strong> ₹{selectedDriver.earnings?.total || 0}</div>
                                        <div><strong>This Month:</strong> ₹{selectedDriver.earnings?.thisMonth || 0}</div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h3 style={{ margin: 0, color: '#1e293b' }}>Location & Settings</h3>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await api.get(`/admin/drivers/${selectedDriver._id}/location`);
                                                    if (response.data.success) {
                                                        const location = response.data.location;
                                                        // Convert coordinates to address if available
                                                        if (location.latitude && location.longitude) {
                                                            const address = await reverseGeocode(location.latitude, location.longitude);
                                                            location.address = address;
                                                        }
                                                        setSelectedDriver(prev => ({
                                                            ...prev,
                                                            location: location
                                                        }));
                                                    }
                                                } catch (error) {
                                                    console.log('Could not refresh location:', error.message);
                                                }
                                            }}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            🔄 Refresh Location
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div><strong>Current Location:</strong> {selectedDriver.location?.address || selectedDriver.currentLocation?.address || (selectedDriver.location?.latitude && selectedDriver.location?.longitude ? `${selectedDriver.location.latitude.toFixed(4)}, ${selectedDriver.location.longitude.toFixed(4)}` : 'Location not shared')}</div>
                                        <div><strong>Coordinates:</strong> {selectedDriver.location?.latitude && selectedDriver.location?.longitude ? `${selectedDriver.location.latitude.toFixed(6)}, ${selectedDriver.location.longitude.toFixed(6)}` : 'Not available'}</div>
                                        <div><strong>Last Updated:</strong> {selectedDriver.location?.updatedAt ? new Date(selectedDriver.location.updatedAt).toLocaleString() : selectedDriver.currentLocation?.timestamp ? new Date(selectedDriver.currentLocation.timestamp).toLocaleString() : 'Never'}</div>
                                        <div><strong>Location Status:</strong> 
                                            <span style={{
                                                marginLeft: '8px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                backgroundColor: selectedDriver.location?.updatedAt && (new Date() - new Date(selectedDriver.location.updatedAt)) < 300000 ? '#dcfce7' : '#fee2e2',
                                                color: selectedDriver.location?.updatedAt && (new Date() - new Date(selectedDriver.location.updatedAt)) < 300000 ? '#16a34a' : '#dc2626'
                                            }}>
                                                {selectedDriver.location?.updatedAt && (new Date() - new Date(selectedDriver.location.updatedAt)) < 300000 ? 'Live' : 'Stale'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <strong>Share Location:</strong>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.put(`/admin/drivers/${selectedDriver._id}/settings`, {
                                                            shareLocation: !selectedDriver.settings?.shareLocation
                                                        });
                                                        setSelectedDriver({...selectedDriver, settings: {...selectedDriver.settings, shareLocation: !selectedDriver.settings?.shareLocation}});
                                                        loadDrivers();
                                                    } catch (error) {
                                                        alert('Failed to update setting');
                                                    }
                                                }}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: selectedDriver.settings?.shareLocation ? '#22c55e' : '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {selectedDriver.settings?.shareLocation ? '✓ Yes' : '✗ No'}
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <strong>Email Notifications:</strong>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.put(`/admin/drivers/${selectedDriver._id}/settings`, {
                                                            emailNotifications: !selectedDriver.settings?.emailNotifications
                                                        });
                                                        setSelectedDriver({...selectedDriver, settings: {...selectedDriver.settings, emailNotifications: !selectedDriver.settings?.emailNotifications}});
                                                        loadDrivers();
                                                    } catch (error) {
                                                        alert('Failed to update setting');
                                                    }
                                                }}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: selectedDriver.settings?.emailNotifications ? '#22c55e' : '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {selectedDriver.settings?.emailNotifications ? '✓ Yes' : '✗ No'}
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <strong>Ride Updates:</strong>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.put(`/admin/drivers/${selectedDriver._id}/settings`, {
                                                            rideUpdates: !selectedDriver.settings?.rideUpdates
                                                        });
                                                        setSelectedDriver({...selectedDriver, settings: {...selectedDriver.settings, rideUpdates: !selectedDriver.settings?.rideUpdates}});
                                                        loadDrivers();
                                                    } catch (error) {
                                                        alert('Failed to update setting');
                                                    }
                                                }}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: selectedDriver.settings?.rideUpdates ? '#22c55e' : '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {selectedDriver.settings?.rideUpdates ? '✓ Yes' : '✗ No'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => toggleDriverStatus(selectedDriver._id, selectedDriver.status)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: selectedDriver.status === 'available' ? '#ef4444' : '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {selectedDriver.status === 'available' ? 'Suspend Driver' : 'Activate Driver'}
                                </button>
                                <button 
                                    onClick={() => setShowDriverModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#64748b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showUserModal && selectedUser && (
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
                            borderRadius: '15px',
                            padding: '30px',
                            maxWidth: '800px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>User Details - {selectedUser.name}</h2>
                                <button 
                                    onClick={() => setShowUserModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#64748b'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Personal Information</h3>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div><strong>Name:</strong> {selectedUser.name}</div>
                                        <div><strong>Email:</strong> {selectedUser.email}</div>
                                        <div><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</div>
                                        <div><strong>Role:</strong> {selectedUser.role || 'user'}</div>
                                        <div><strong>Status:</strong> 
                                            <span style={{
                                                marginLeft: '8px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                backgroundColor: (selectedUser.status || 'active') === 'active' ? '#dcfce7' : '#fee2e2',
                                                color: (selectedUser.status || 'active') === 'active' ? '#16a34a' : '#dc2626'
                                            }}>
                                                {selectedUser.status || 'active'}
                                            </span>
                                        </div>
                                        <div><strong>2FA Enabled:</strong> 
                                            <span style={{
                                                marginLeft: '8px',
                                                color: selectedUser.twoFactorEnabled ? '#16a34a' : '#dc2626'
                                            }}>
                                                {selectedUser.twoFactorEnabled ? '✓ Yes' : '✗ No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Account Activity</h3>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                                        <div><strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</div>
                                        <div><strong>Account Age:</strong> {Math.floor((new Date() - new Date(selectedUser.createdAt)) / (1000 * 60 * 60 * 24))} days</div>
                                        <div><strong>Total Rides:</strong> {selectedUser.totalRides || 0}</div>
                                        <div><strong>Total Spent:</strong> ₹{selectedUser.totalSpent || 0}</div>
                                        <div><strong>Average Rating:</strong> {selectedUser.averageRating || 'N/A'}/5 ⭐</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button 
                                    onClick={() => setShowUserModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#64748b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}