import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import io from 'socket.io-client';

export default function LiveMonitoring() {
    const [liveData, setLiveData] = useState({
        activeTrips: [],
        onlineDrivers: [],
        systemMetrics: {},
        alerts: []
    });
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const intervalRef = useRef(null);

    useEffect(() => {
        initializeSocket();
        startLiveUpdates();
        
        return () => {
            if (socket) socket.disconnect();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const initializeSocket = () => {
        const newSocket = io('http://localhost:5000');
        
        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('joinAdminRoom');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('liveUpdate', (data) => {
            setLiveData(prev => ({
                ...prev,
                ...data
            }));
            setLastUpdate(new Date());
        });

        newSocket.on('tripUpdate', (tripData) => {
            setLiveData(prev => ({
                ...prev,
                activeTrips: prev.activeTrips.map(trip => 
                    trip._id === tripData._id ? tripData : trip
                )
            }));
        });

        newSocket.on('driverLocationUpdate', (locationData) => {
            setLiveData(prev => ({
                ...prev,
                onlineDrivers: prev.onlineDrivers.map(driver =>
                    driver._id === locationData.driverId 
                        ? { ...driver, location: locationData }
                        : driver
                )
            }));
        });

        setSocket(newSocket);
    };

    const startLiveUpdates = () => {
        fetchLiveData();
        intervalRef.current = setInterval(fetchLiveData, 5000); // Update every 5 seconds
    };

    const fetchLiveData = async () => {
        try {
            const [tripsRes, driversRes, metricsRes] = await Promise.all([
                api.get('/rides/active-trips'),
                api.get('/admin/online-drivers'),
                api.get('/admin/system-metrics')
            ]);

            setLiveData({
                activeTrips: tripsRes.data.trips || [],
                onlineDrivers: driversRes.data.drivers || [],
                systemMetrics: metricsRes.data.metrics || {},
                alerts: generateAlerts(tripsRes.data.trips, driversRes.data.drivers)
            });
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching live data:', error);
        }
    };

    const generateAlerts = (trips, drivers) => {
        const alerts = [];
        
        // Long duration trips
        trips?.forEach(trip => {
            if (trip.timestamps?.started_at) {
                const duration = (new Date() - new Date(trip.timestamps.started_at)) / (1000 * 60);
                if (duration > 60) {
                    alerts.push({
                        type: 'warning',
                        message: `Trip ${trip._id.slice(-6)} running for ${Math.floor(duration)} minutes`,
                        priority: 'high'
                    });
                }
            }
        });

        // Low driver availability
        const availableDrivers = drivers?.filter(d => d.status === 'available').length || 0;
        if (availableDrivers < 3) {
            alerts.push({
                type: 'error',
                message: `Only ${availableDrivers} drivers available`,
                priority: 'urgent'
            });
        }

        return alerts;
    };

    return (
        <div className="live-monitoring">
            {/* Connection Status */}
            <div className="connection-status">
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    <div className="status-dot"></div>
                    <span>{isConnected ? 'Live Connected' : 'Disconnected'}</span>
                </div>
                <div className="last-update">
                    Last Update: {lastUpdate.toLocaleTimeString()}
                </div>
            </div>

            {/* System Alerts */}
            {liveData.alerts.length > 0 && (
                <div className="alerts-section">
                    <h3>🚨 System Alerts</h3>
                    <div className="alerts-grid">
                        {liveData.alerts.map((alert, index) => (
                            <div key={index} className={`alert alert-${alert.type} priority-${alert.priority}`}>
                                <div className="alert-icon">
                                    {alert.type === 'error' ? '⚠️' : alert.type === 'warning' ? '🔔' : 'ℹ️'}
                                </div>
                                <div className="alert-message">{alert.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Live Metrics */}
            <div className="live-metrics">
                <div className="metric-card">
                    <div className="metric-icon">🚗</div>
                    <div className="metric-value">{liveData.activeTrips.length}</div>
                    <div className="metric-label">Active Trips</div>
                    <div className="metric-trend">
                        {liveData.systemMetrics.tripsTrend > 0 ? '📈' : '📉'}
                    </div>
                </div>
                
                <div className="metric-card">
                    <div className="metric-icon">🚕</div>
                    <div className="metric-value">{liveData.onlineDrivers.length}</div>
                    <div className="metric-label">Online Drivers</div>
                    <div className="metric-trend">
                        {liveData.systemMetrics.driversTrend > 0 ? '📈' : '📉'}
                    </div>
                </div>
                
                <div className="metric-card">
                    <div className="metric-icon">💰</div>
                    <div className="metric-value">₹{liveData.systemMetrics.realtimeRevenue || 0}</div>
                    <div className="metric-label">Live Revenue</div>
                    <div className="metric-trend">📊</div>
                </div>
                
                <div className="metric-card">
                    <div className="metric-icon">⚡</div>
                    <div className="metric-value">{liveData.systemMetrics.systemLoad || 0}%</div>
                    <div className="metric-label">System Load</div>
                    <div className="metric-trend">
                        {liveData.systemMetrics.systemLoad > 80 ? '🔴' : '🟢'}
                    </div>
                </div>
            </div>

            {/* Live Trip Tracking */}
            <div className="live-trips">
                <h3>🗺️ Live Trip Tracking</h3>
                {liveData.activeTrips.length === 0 ? (
                    <div className="no-trips">
                        <div className="no-trips-icon">🌙</div>
                        <p>No active trips - All quiet on the roads</p>
                    </div>
                ) : (
                    <div className="trips-grid">
                        {liveData.activeTrips.map(trip => (
                            <div key={trip._id} className="live-trip-card">
                                <div className="trip-header">
                                    <div className="trip-id">#{trip._id.slice(-6).toUpperCase()}</div>
                                    <div className="trip-status">
                                        <div className="status-dot pulsing"></div>
                                        {trip.status === 'in_progress' ? 'LIVE' : 'EN ROUTE'}
                                    </div>
                                </div>
                                
                                <div className="trip-participants">
                                    <div className="participant">
                                        <div className="avatar passenger">
                                            {trip.user_id?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="participant-info">
                                            <div className="name">{trip.user_id?.name}</div>
                                            <div className="role">Passenger</div>
                                        </div>
                                    </div>
                                    
                                    <div className="participant">
                                        <div className="avatar driver">
                                            {trip.driver_id?.name?.charAt(0) || 'D'}
                                        </div>
                                        <div className="participant-info">
                                            <div className="name">{trip.driver_id?.name}</div>
                                            <div className="role">Driver</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="trip-route">
                                    <div className="route-point pickup">
                                        <div className="route-icon">📍</div>
                                        <div className="route-text">
                                            {trip.pickup_location?.address || 'Pickup Location'}
                                        </div>
                                    </div>
                                    <div className="route-line"></div>
                                    <div className="route-point dropoff">
                                        <div className="route-icon">🎯</div>
                                        <div className="route-text">
                                            {trip.drop_location?.address || 'Drop Location'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="trip-details">
                                    <div className="detail">
                                        <span className="label">Duration:</span>
                                        <span className="value">
                                            {trip.timestamps?.started_at 
                                                ? Math.floor((new Date() - new Date(trip.timestamps.started_at)) / (1000 * 60)) + 'm'
                                                : 'Not started'
                                            }
                                        </span>
                                    </div>
                                    <div className="detail">
                                        <span className="label">Fare:</span>
                                        <span className="value">₹{trip.fare}</span>
                                    </div>
                                    <div className="detail">
                                        <span className="label">Distance:</span>
                                        <span className="value">{trip.distance?.toFixed(1)}km</span>
                                    </div>
                                </div>
                                
                                {trip.tracking?.currentLocation && (
                                    <div className="live-location">
                                        <div className="location-header">
                                            <span>📍 Live Location</span>
                                            <span className="location-time">
                                                {new Date(trip.tracking.lastUpdate).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="coordinates">
                                            {trip.tracking.currentLocation.latitude?.toFixed(4)}, 
                                            {trip.tracking.currentLocation.longitude?.toFixed(4)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Online Drivers Map */}
            <div className="drivers-section">
                <h3>🚕 Online Drivers ({liveData.onlineDrivers.length})</h3>
                <div className="drivers-grid">
                    {liveData.onlineDrivers.map(driver => (
                        <div key={driver._id} className="driver-card">
                            <div className="driver-header">
                                <div className="driver-avatar">
                                    {driver.name?.charAt(0) || 'D'}
                                </div>
                                <div className="driver-info">
                                    <div className="driver-name">{driver.name}</div>
                                    <div className="driver-status">
                                        <div className="status-dot online"></div>
                                        {driver.status}
                                    </div>
                                </div>
                                <div className="driver-rating">
                                    ⭐ {driver.rating || 0}
                                </div>
                            </div>
                            
                            {driver.location && (
                                <div className="driver-location">
                                    <div className="location-text">
                                        📍 {driver.location.address || 'Location updating...'}
                                    </div>
                                    <div className="location-time">
                                        Updated: {new Date(driver.location.updatedAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .live-monitoring {
                    padding: 20px;
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .connection-status {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                }

                .status-indicator.connected {
                    color: #22c55e;
                }

                .status-indicator.disconnected {
                    color: #ef4444;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: currentColor;
                    animation: pulse 2s infinite;
                }

                .last-update {
                    color: #64748b;
                    font-size: 14px;
                }

                .alerts-section {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .alerts-grid {
                    display: grid;
                    gap: 10px;
                    margin-top: 15px;
                }

                .alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    border-left: 4px solid;
                }

                .alert-error {
                    background: #fef2f2;
                    border-color: #ef4444;
                    color: #dc2626;
                }

                .alert-warning {
                    background: #fffbeb;
                    border-color: #f59e0b;
                    color: #d97706;
                }

                .priority-urgent {
                    animation: alertPulse 1s infinite;
                }

                .live-metrics {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .metric-card {
                    background: white;
                    padding: 20px;
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: hidden;
                }

                .metric-icon {
                    font-size: 32px;
                    margin-bottom: 10px;
                }

                .metric-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 5px;
                }

                .metric-label {
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 600;
                }

                .metric-trend {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    font-size: 16px;
                }

                .live-trips {
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .no-trips {
                    text-align: center;
                    padding: 40px;
                    color: #64748b;
                }

                .no-trips-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                }

                .trips-grid {
                    display: grid;
                    gap: 20px;
                    margin-top: 20px;
                }

                .live-trip-card {
                    border: 2px solid #22c55e;
                    border-radius: 15px;
                    padding: 20px;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                }

                .trip-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .trip-id {
                    font-weight: 700;
                    color: #1e293b;
                }

                .trip-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #22c55e;
                    font-weight: 600;
                    font-size: 12px;
                }

                .status-dot.pulsing {
                    animation: pulse 1s infinite;
                }

                .trip-participants {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .participant {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                }

                .avatar.passenger {
                    background: #3b82f6;
                }

                .avatar.driver {
                    background: #22c55e;
                }

                .participant-info .name {
                    font-weight: 600;
                    color: #1e293b;
                }

                .participant-info .role {
                    font-size: 12px;
                    color: #64748b;
                }

                .trip-route {
                    margin-bottom: 15px;
                }

                .route-point {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .route-icon {
                    font-size: 16px;
                }

                .route-text {
                    font-size: 14px;
                    color: #374151;
                }

                .route-line {
                    width: 2px;
                    height: 20px;
                    background: #d1d5db;
                    margin-left: 8px;
                    margin-bottom: 8px;
                }

                .trip-details {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .detail {
                    text-align: center;
                }

                .detail .label {
                    display: block;
                    font-size: 12px;
                    color: #64748b;
                    margin-bottom: 4px;
                }

                .detail .value {
                    font-weight: 600;
                    color: #1e293b;
                }

                .live-location {
                    background: rgba(34, 197, 94, 0.1);
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }

                .location-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 5px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #16a34a;
                }

                .coordinates {
                    font-family: monospace;
                    font-size: 12px;
                    color: #374151;
                }

                .drivers-section {
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .drivers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 15px;
                    margin-top: 20px;
                }

                .driver-card {
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 15px;
                    background: #fafafa;
                }

                .driver-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 10px;
                }

                .driver-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #667eea;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }

                .driver-info {
                    flex: 1;
                }

                .driver-name {
                    font-weight: 600;
                    color: #1e293b;
                }

                .driver-status {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #22c55e;
                }

                .status-dot.online {
                    background: #22c55e;
                }

                .driver-rating {
                    font-size: 14px;
                    color: #f59e0b;
                }

                .driver-location {
                    background: white;
                    padding: 10px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                }

                .location-text {
                    font-size: 13px;
                    color: #374151;
                    margin-bottom: 4px;
                }

                .location-time {
                    font-size: 11px;
                    color: #64748b;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @keyframes alertPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
            `}</style>
        </div>
    );
}