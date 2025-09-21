import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function OperationsAnalytics() {
    const [operations, setOperations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        timeRange: '24h',
        operationType: 'all',
        userRole: 'all'
    });
    const [stats, setStats] = useState({
        totalOperations: 0,
        uniqueUsers: 0,
        topOperations: [],
        hourlyActivity: []
    });

    useEffect(() => {
        loadOperations();
        const interval = setInterval(loadOperations, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [filters]);

    const loadOperations = async () => {
        try {
            const response = await api.get('/analytics/operations', { params: filters });
            if (response.data.success) {
                setOperations(response.data.operations);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to load operations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOperationIcon = (type) => {
        const icons = {
            'SESSION_START': '🚀',
            'PICKUP_LOCATION_SELECTED': '📍',
            'DESTINATION_LOCATION_SELECTED': '🎯',
            'VEHICLE_SELECTION_STARTED': '🚗',
            'VEHICLE_SELECTED': '✅',
            'PAYMENT_METHOD_SELECTED': '💳',
            'RIDE_BOOKING_SUCCESS': '🎉',
            'RIDE_BOOKING_FALLBACK': '⚠️',
            'BOOKING_RESET': '🔄',
            'RIDE_HISTORY_VIEWED': '📋',
            'TAB_SWITCHED': '🔀',
            'SIGNUP_REDIRECT_FROM_BOOKING': '👤',
            'LOGIN_SUCCESS': '🔐',
            'LOGOUT': '👋',
            'PROFILE_UPDATED': '✏️',
            'DRIVER_APPLICATION_SUBMITTED': '🚕',
            'CONTACT_FORM_SUBMITTED': '📧'
        };
        return icons[type] || '📊';
    };

    const getOperationColor = (type) => {
        if (type.includes('SUCCESS') || type.includes('SELECTED')) return '#22c55e';
        if (type.includes('ERROR') || type.includes('FALLBACK')) return '#ef4444';
        if (type.includes('STARTED') || type.includes('REDIRECT')) return '#f59e0b';
        return '#667eea';
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                <p>Loading operations analytics...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: '#1f2937' }}>Live Operations Analytics</h2>
                <button 
                    onClick={loadOperations}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Filters */}
            <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '30px', 
                padding: '20px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '10px' 
            }}>
                <select 
                    value={filters.timeRange} 
                    onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                </select>
                
                <select 
                    value={filters.operationType} 
                    onChange={(e) => setFilters({...filters, operationType: e.target.value})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                    <option value="all">All Operations</option>
                    <option value="booking">Booking Operations</option>
                    <option value="auth">Authentication</option>
                    <option value="navigation">Navigation</option>
                </select>
                
                <select 
                    value={filters.userRole} 
                    onChange={(e) => setFilters({...filters, userRole: e.target.value})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                    <option value="all">All Users</option>
                    <option value="user">Customers</option>
                    <option value="driver">Drivers</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{stats.totalOperations}</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Total Operations</div>
                </div>
                
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{stats.uniqueUsers}</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Active Users</div>
                </div>
                
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔥</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                        {Math.round(stats.totalOperations / Math.max(stats.uniqueUsers, 1))}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>Avg Operations/User</div>
                </div>
            </div>

            {/* Top Operations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Top Operations</h3>
                    {stats.topOperations?.map((op, index) => (
                        <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '10px 0',
                            borderBottom: index < stats.topOperations.length - 1 ? '1px solid #f1f5f9' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '20px' }}>{getOperationIcon(op.operation)}</span>
                                <span style={{ fontSize: '14px', color: '#374151' }}>{op.operation.replace(/_/g, ' ')}</span>
                            </div>
                            <span style={{ fontWeight: '600', color: '#1f2937' }}>{op.count}</span>
                        </div>
                    ))}
                </div>

                {/* Recent Operations */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Recent Activity</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {operations.slice(0, 10).map((op, index) => (
                            <motion.div 
                                key={op._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px',
                                    padding: '12px 0',
                                    borderBottom: index < 9 ? '1px solid #f1f5f9' : 'none'
                                }}
                            >
                                <div style={{ 
                                    fontSize: '20px',
                                    width: '30px',
                                    textAlign: 'center'
                                }}>
                                    {getOperationIcon(op.operation)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                        {op.operation.replace(/_/g, ' ')}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        {op.userName} • {formatTimeAgo(op.timestamp)}
                                    </div>
                                </div>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: getOperationColor(op.operation)
                                }}></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Operations Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, color: '#1f2937' }}>All Operations ({operations.length})</h3>
                </div>
                
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Operation</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>User</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Details</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Time</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map((op, index) => (
                                <tr key={op._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '16px' }}>{getOperationIcon(op.operation)}</span>
                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                                {op.operation.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                                {op.userName}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {op.userRole} • {op.userEmail}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '200px' }}>
                                            {JSON.stringify(op.details, null, 0).substring(0, 100)}
                                            {JSON.stringify(op.details).length > 100 && '...'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            {new Date(op.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            {op.metadata?.url ? new URL(op.metadata.url).pathname : 'N/A'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}