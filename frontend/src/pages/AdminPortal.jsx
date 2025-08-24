import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AdminAnalytics from '../components/AdminAnalytics';
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
    const [chats, setChats] = useState([]);
    const [verificationRequests, setVerificationRequests] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        loadUsers();
        loadDrivers();
        loadTrips();
        loadComplaints();
        loadAnalytics();
        loadChats();
        loadVerificationRequests();
        
        // Setup socket connection for real-time chat updates
        const newSocket = io('http://localhost:5000');
        
        newSocket.on('connect', () => {
            console.log('Admin connected to chat server');
        });
        
        newSocket.on('chat-message', (message) => {
            // Update messages if viewing the same chat
            if (selectedChat && message.userId === selectedChat.userId) {
                setMessages(prev => [...prev, message]);
            }
            // Refresh chat list to update last message
            loadChats();
        });
        
        newSocket.on('new-chat-notification', () => {
            loadChats(); // Refresh chat list when new chat starts
        });
        
        setSocket(newSocket);
        
        return () => {
            newSocket.disconnect();
        };
    }, [selectedChat]);

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

    const loadChats = async () => {
        try {
            const response = await api.get('/admin/chats');
            setChats(response.data);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };
    
    const loadVerificationRequests = async () => {
        try {
            const response = await api.get('/admin/verification-requests');
            setVerificationRequests(response.data);
        } catch (error) {
            console.error('Error loading verification requests:', error);
        }
    };
    
    const approveVerification = async (driverId) => {
        try {
            await api.put(`/admin/verification/${driverId}/approve`);
            loadVerificationRequests();
            loadDrivers();
        } catch (error) {
            alert('Failed to approve verification');
        }
    };
    
    const rejectVerification = async (driverId) => {
        try {
            await api.put(`/admin/verification/${driverId}/reject`);
            loadVerificationRequests();
        } catch (error) {
            alert('Failed to reject verification');
        }
    };

    const selectChat = async (chat) => {
        setSelectedChat(chat);
        try {
            const response = await api.get(`/admin/chats/${chat.userId}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            await api.post(`/admin/chats/${selectedChat.userId}/message`, {
                text: newMessage,
                sender: 'Admin Support',
                senderType: 'admin'
            });
            setNewMessage('');
            selectChat(selectedChat); // Reload messages
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>
                    👨💼 Admin Portal
                </h1>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'users', label: '👥 User Management' },
                        { id: 'drivers', label: '🚕 Driver Management' },
                        { id: 'verification', label: '📋 Verification Requests' },
                        { id: 'trips', label: '🗺️ Trip Monitoring' },
                        { id: 'chats', label: '💬 Live Chat' },
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

                {/* Verification Requests Tab */}
                {activeTab === 'verification' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Driver Verification Requests</h2>
                        
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {verificationRequests.map(request => (
                                <div key={request._id} style={{
                                    padding: '20px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    backgroundColor: request.status === 'pending' ? '#fef3c7' : '#f0fdf4'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 10px 0' }}>{request.name}</h3>
                                            <p style={{ margin: '0 0 10px 0', color: '#64748b' }}>
                                                Email: {request.email} • Phone: {request.phone}
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                                                {request.verificationRequest?.documents && Object.entries(request.verificationRequest.documents).map(([type, filename]) => (
                                                    <div key={type} style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                                        <strong>{type}:</strong> 
                                                        <a href={`/uploads/verification/${filename}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px', color: '#667eea' }}>
                                                            View Document
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                                Submitted: {new Date(request.verificationRequest?.submittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{ marginLeft: '20px', display: 'flex', gap: '10px' }}>
                                            {request.verificationRequest?.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => approveVerification(request._id)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            backgroundColor: '#22c55e',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => rejectVerification(request._id)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                backgroundColor: request.verificationRequest?.status === 'approved' ? '#dcfce7' : 
                                                               request.verificationRequest?.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                                color: request.verificationRequest?.status === 'approved' ? '#16a34a' : 
                                                       request.verificationRequest?.status === 'rejected' ? '#dc2626' : '#d97706'
                                            }}>
                                                {request.verificationRequest?.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
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

                {/* Chat Management Tab */}
                {activeTab === 'chats' && (
                    <div style={{ display: 'flex', height: '600px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {/* Chat List */}
                        <div style={{ width: '300px', borderRight: '1px solid #e2e8f0' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>💬 User Chats ({chats.length})</h3>
                            </div>
                            <div style={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
                                {chats.map((chat) => (
                                    <div
                                        key={chat.userId}
                                        onClick={() => selectChat(chat)}
                                        style={{
                                            padding: '15px 20px',
                                            borderBottom: '1px solid #f1f5f9',
                                            cursor: 'pointer',
                                            backgroundColor: selectedChat?.userId === chat.userId ? '#f0f9ff' : 'white'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                            {chat.userName || 'User'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                            {chat.userEmail}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                            Last: {new Date(chat.lastMessageTime).toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#4a5568', marginTop: '5px' }}>
                                            {chat.lastMessage?.substring(0, 30)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {selectedChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px' }}>
                                            Chat with {selectedChat.userName || 'User'}
                                        </h3>
                                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                                            {selectedChat.userEmail}
                                        </p>
                                    </div>

                                    {/* Messages */}
                                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
                                        {messages.map((msg, index) => (
                                            <div key={index} style={{
                                                marginBottom: '15px',
                                                display: 'flex',
                                                justifyContent: msg.senderType === 'admin' ? 'flex-end' : 'flex-start'
                                            }}>
                                                <div style={{
                                                    maxWidth: '70%',
                                                    padding: '10px 15px',
                                                    borderRadius: '15px',
                                                    backgroundColor: msg.senderType === 'admin' ? '#667eea' : 'white',
                                                    color: msg.senderType === 'admin' ? 'white' : '#2d3748',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                }}>
                                                    <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                                                    <small style={{
                                                        opacity: 0.7,
                                                        fontSize: '11px',
                                                        display: 'block',
                                                        marginTop: '5px'
                                                    }}>
                                                        {msg.sender} - {new Date(msg.timestamp).toLocaleTimeString()}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Message Input */}
                                    <form onSubmit={sendMessage} style={{
                                        padding: '20px',
                                        borderTop: '1px solid #e2e8f0',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        gap: '10px'
                                    }}>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your response..."
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '20px',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                opacity: !newMessage.trim() ? 0.5 : 1
                                            }}
                                        >
                                            Send
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#64748b'
                                }}>
                                    Select a chat to view messages
                                </div>
                            )}
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
                    <AdminAnalytics />
                )}
            </div>
        </div>
    );
}