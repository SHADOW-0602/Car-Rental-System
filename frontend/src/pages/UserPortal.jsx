import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function UserPortal() {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState('search');
    const [rides, setRides] = useState([]);
    const [availableCabs, setAvailableCabs] = useState([]);
    const [searchData, setSearchData] = useState({
        pickup: '',
        destination: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        loadRideHistory();
        loadAvailableCabs();
    }, []);

    const loadRideHistory = async () => {
        try {
            const response = await api.get('/rides/mine');
            setRides(response.data);
        } catch (error) {
            console.error('Error loading rides:', error);
        }
    };

    const loadAvailableCabs = async () => {
        try {
            const response = await api.get('/vehicles');
            setAvailableCabs(response.data);
        } catch (error) {
            console.error('Error loading cabs:', error);
        }
    };

    const bookCab = async (cabId) => {
        try {
            await api.post('/rides/book', {
                vehicleId: cabId,
                pickup_location: { address: searchData.pickup },
                drop_location: { address: searchData.destination },
                scheduled_time: `${searchData.date} ${searchData.time}`
            });
            alert('Cab booked successfully!');
            loadRideHistory();
        } catch (error) {
            alert('Booking failed: ' + error.response?.data?.error);
        }
    };

    const rateDriver = async (rideId, rating, review) => {
        try {
            await api.post(`/rides/${rideId}/rate`, { rating, review });
            alert('Rating submitted!');
            loadRideHistory();
        } catch (error) {
            alert('Rating failed');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>
                    🚗 User Portal
                </h1>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    {[
                        { id: 'search', label: '🔍 Search & Book', icon: '🔍' },
                        { id: 'history', label: '📋 Ride History', icon: '📋' },
                        { id: 'payments', label: '💳 Payments', icon: '💳' }
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

                {/* Search & Book Tab */}
                {activeTab === 'search' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Search Available Cabs</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Pickup Location"
                                value={searchData.pickup}
                                onChange={(e) => setSearchData({...searchData, pickup: e.target.value})}
                                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <input
                                type="text"
                                placeholder="Destination"
                                value={searchData.destination}
                                onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <input
                                type="date"
                                value={searchData.date}
                                onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <input
                                type="time"
                                value={searchData.time}
                                onChange={(e) => setSearchData({...searchData, time: e.target.value})}
                                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {availableCabs.map(cab => (
                                <div key={cab._id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '20px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px'
                                }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{cab.make} {cab.model}</h3>
                                        <p style={{ margin: 0, color: '#64748b' }}>
                                            {cab.type} • ₹{cab.pricePerKm}/km • {cab.seats} seats
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => bookCab(cab._id)}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#22c55e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ride History Tab */}
                {activeTab === 'history' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Ride History & Reviews</h2>
                        
                        {rides.map(ride => (
                            <div key={ride._id} style={{
                                padding: '20px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                marginBottom: '15px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>
                                            {ride.pickup_location?.address} → {ride.drop_location?.address}
                                        </h3>
                                        <p style={{ margin: 0, color: '#64748b' }}>
                                            {new Date(ride.createdAt).toLocaleDateString()} • ₹{ride.fare}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{
                                            padding: '5px 10px',
                                            borderRadius: '15px',
                                            fontSize: '12px',
                                            backgroundColor: ride.status === 'completed' ? '#dcfce7' : '#fef3c7',
                                            color: ride.status === 'completed' ? '#16a34a' : '#d97706'
                                        }}>
                                            {ride.status}
                                        </span>
                                        {ride.status === 'completed' && !ride.rating && (
                                            <button
                                                onClick={() => {
                                                    const rating = prompt('Rate driver (1-5):');
                                                    const review = prompt('Leave a review:');
                                                    if (rating) rateDriver(ride._id, parseInt(rating), review);
                                                }}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#667eea',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Rate Driver
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Payment Methods & Invoices</h2>
                        
                        <div style={{ marginBottom: '30px' }}>
                            <h3>Payment Methods</h3>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>💳</div>
                                    <p style={{ margin: 0 }}>Credit/Debit Card</p>
                                </div>
                                <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>📱</div>
                                    <p style={{ margin: 0 }}>UPI/Wallet</p>
                                </div>
                                <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>💵</div>
                                    <p style={{ margin: 0 }}>Cash</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3>Recent Invoices</h3>
                            {rides.filter(ride => ride.status === 'completed').map(ride => (
                                <div key={ride._id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    marginBottom: '10px'
                                }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>
                                            Invoice #{ride._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                            {new Date(ride.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>₹{ride.fare}</p>
                                        <button style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}>
                                            Download
                                        </button>
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