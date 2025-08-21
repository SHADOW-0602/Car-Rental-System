import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    monthlyData: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockData = {
        totalUsers: 1250,
        totalDrivers: 340,
        totalRides: 5680,
        monthlyData: [
          { month: 'Jan', users: 100, drivers: 25, rides: 450 },
          { month: 'Feb', users: 150, drivers: 35, rides: 620 },
          { month: 'Mar', users: 200, drivers: 45, rides: 780 },
          { month: 'Apr', users: 280, drivers: 60, rides: 920 },
          { month: 'May', users: 350, drivers: 75, rides: 1100 },
          { month: 'Jun', users: 420, drivers: 90, rides: 1350 }
        ],
        recentActivity: [
          { type: 'user_signup', count: 15, time: '2 hours ago' },
          { type: 'driver_signup', count: 3, time: '4 hours ago' },
          { type: 'ride_completed', count: 45, time: '1 hour ago' }
        ]
      };
      setAnalytics(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '24px' }}>📊</div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '30px', color: '#2d3748' }}>📊 Analytics Dashboard</h2>
      
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '2px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#667eea',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>👥</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#2d3748' }}>{analytics.totalUsers}</h3>
              <p style={{ margin: 0, color: '#718096' }}>Total Users</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '2px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#48bb78',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>🚕</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#2d3748' }}>{analytics.totalDrivers}</h3>
              <p style={{ margin: 0, color: '#718096' }}>Total Drivers</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '2px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#ed8936',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>🚗</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#2d3748' }}>{analytics.totalRides}</h3>
              <p style={{ margin: 0, color: '#718096' }}>Total Rides</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Growth Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '25px', color: '#2d3748' }}>📈 Monthly Growth</h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          gap: '20px', 
          height: '300px',
          padding: '20px 0'
        }}>
          {analytics.monthlyData.map((data, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              flex: 1
            }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'end' }}>
                <div style={{
                  width: '20px',
                  height: `${(data.users / 500) * 200}px`,
                  backgroundColor: '#667eea',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '10px'
                }}></div>
                <div style={{
                  width: '20px',
                  height: `${(data.drivers / 100) * 200}px`,
                  backgroundColor: '#48bb78',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '10px'
                }}></div>
                <div style={{
                  width: '20px',
                  height: `${(data.rides / 1500) * 200}px`,
                  backgroundColor: '#ed8936',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '10px'
                }}></div>
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', fontWeight: '600' }}>
                {data.month}
              </p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#667eea', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '14px' }}>Users</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#48bb78', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '14px' }}>Drivers</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ed8936', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '14px' }}>Rides</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>🔔 Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {analytics.recentActivity.map((activity, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              backgroundColor: '#f7fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: activity.type === 'user_signup' ? '#667eea' : 
                                activity.type === 'driver_signup' ? '#48bb78' : '#ed8936',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                {activity.type === 'user_signup' ? '👤' : 
                 activity.type === 'driver_signup' ? '🚕' : '✅'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#2d3748' }}>
                  {activity.count} {activity.type.replace('_', ' ')}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}