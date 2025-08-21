import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function AdminUsers() {
  const { user } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    // Mock data - replace with actual API calls
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '9876543210', status: 'active', joinDate: '2024-01-15', totalRides: 25 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', status: 'active', joinDate: '2024-01-10', totalRides: 18 },
      { id: 3, name: 'Bob Wilson', email: 'bob@example.com', phone: '9876543212', status: 'suspended', joinDate: '2024-01-05', totalRides: 5 }
    ]);

    setDrivers([
      { id: 1, name: 'Mike Driver', email: 'mike@example.com', phone: '9876543220', status: 'active', joinDate: '2024-01-12', totalRides: 45, rating: 4.8, vehicle: 'Honda City' },
      { id: 2, name: 'Sarah Driver', email: 'sarah@example.com', phone: '9876543221', status: 'active', joinDate: '2024-01-08', totalRides: 62, rating: 4.9, vehicle: 'Toyota Innova' },
      { id: 3, name: 'Tom Driver', email: 'tom@example.com', phone: '9876543222', status: 'pending', joinDate: '2024-01-14', totalRides: 0, rating: 0, vehicle: 'Maruti Swift' }
    ]);
  }, []);

  const toggleUserStatus = (userId, currentStatus) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: currentStatus === 'active' ? 'suspended' : 'active' } : u
    ));
  };

  const toggleDriverStatus = (driverId, currentStatus) => {
    setDrivers(drivers.map(d => 
      d.id === driverId ? { ...d, status: currentStatus === 'active' ? 'suspended' : 'active' } : d
    ));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748' }}>
          👥 User Management
        </h1>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '25px',
              backgroundColor: activeTab === 'users' ? '#667eea' : 'white',
              color: activeTab === 'users' ? 'white' : '#64748b',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            👤 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '25px',
              backgroundColor: activeTab === 'drivers' ? '#667eea' : 'white',
              color: activeTab === 'drivers' ? 'white' : '#64748b',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            🚕 Drivers ({drivers.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>User Accounts</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>User</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Contact</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Rides</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#2d3748' }}>{user.name}</div>
                          <div style={{ fontSize: '14px', color: '#718096' }}>Joined: {user.joinDate}</div>
                        </div>
                      </td>
                      <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ color: '#2d3748' }}>{user.email}</div>
                          <div style={{ fontSize: '14px', color: '#718096' }}>{user.phone}</div>
                        </div>
                      </td>
                      <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#dbeafe',
                          color: '#2563eb',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {user.totalRides} rides
                        </span>
                      </td>
                      <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                          color: user.status === 'active' ? '#16a34a' : '#dc2626'
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.status)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: user.status === 'active' ? '#ef4444' : '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
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

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Driver Accounts</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {drivers.map(driver => (
                <div key={driver.id} style={{
                  padding: '25px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '15px',
                  backgroundColor: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#667eea',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '18px'
                        }}>
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, color: '#2d3748' }}>{driver.name}</h3>
                          <p style={{ margin: '2px 0', color: '#718096' }}>{driver.email}</p>
                          <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>{driver.phone}</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                        <div>
                          <span style={{ fontSize: '14px', color: '#718096' }}>Vehicle</span>
                          <p style={{ margin: 0, fontWeight: '600', color: '#2d3748' }}>{driver.vehicle}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '14px', color: '#718096' }}>Total Rides</span>
                          <p style={{ margin: 0, fontWeight: '600', color: '#2d3748' }}>{driver.totalRides}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '14px', color: '#718096' }}>Rating</span>
                          <p style={{ margin: 0, fontWeight: '600', color: '#2d3748' }}>
                            {driver.rating > 0 ? `⭐ ${driver.rating}` : 'No ratings yet'}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '14px', color: '#718096' }}>Joined</span>
                          <p style={{ margin: 0, fontWeight: '600', color: '#2d3748' }}>{driver.joinDate}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'end' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: 
                          driver.status === 'active' ? '#dcfce7' :
                          driver.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color:
                          driver.status === 'active' ? '#16a34a' :
                          driver.status === 'pending' ? '#d97706' : '#dc2626'
                      }}>
                        {driver.status}
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {driver.status === 'pending' && (
                          <button
                            onClick={() => toggleDriverStatus(driver.id, 'pending')}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#22c55e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Approve
                          </button>
                        )}
                        
                        {driver.status !== 'pending' && (
                          <button
                            onClick={() => toggleDriverStatus(driver.id, driver.status)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: driver.status === 'active' ? '#ef4444' : '#22c55e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            {driver.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}