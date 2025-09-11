import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    summary: {
      totalRides: 0,
      totalRevenue: 0,
      averageRating: 0,
      completionRate: 0,
      dailyData: []
    },
    today: {
      rides: 0,
      revenue: 0,
      activeDrivers: 0,
      totalUsers: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const generateAnalytics = async () => {
    try {
      await api.post('/admin/analytics/generate');
      fetchAnalytics();
    } catch (error) {
      console.error('Error generating analytics:', error);
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
      
      {/* Header with Generate Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#2d3748' }}>📊 Real-Time Analytics Dashboard</h2>
        <button 
          onClick={generateAnalytics}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Generate Analytics
        </button>
      </div>

      {/* Today's Stats */}
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
              <h3 style={{ margin: 0, fontSize: '28px', color: '#2d3748' }}>{analytics.today.totalUsers}</h3>
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
              <h3 style={{ margin: 0, fontSize: '28px', color: '#2d3748' }}>{analytics.today.activeDrivers}</h3>
              <p style={{ margin: 0, color: '#718096' }}>Active Drivers</p>
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
              <h3 style={{ margin: 0, fontSize: '28px', color: '#2d3748' }}>{analytics.today.rides}</h3>
              <p style={{ margin: 0, color: '#718096' }}>Today's Rides</p>
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
              backgroundColor: '#38b2ac',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>💰</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#2d3748' }}>₹{analytics.today.revenue}</h3>
              <p style={{ margin: 0, color: '#718096' }}>Today's Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Total Rides (30 days)</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{analytics.summary.totalRides}</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Total Revenue</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#48bb78' }}>₹{analytics.summary.totalRevenue}</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Average Rating</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ed8936' }}>{analytics.summary.averageRating.toFixed(1)}/5 ⭐</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Completion Rate</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#38b2ac' }}>{analytics.summary.completionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '25px', color: '#2d3748' }}>📈 Daily Trends (Last 30 Days)</h3>
        {analytics.summary.dailyData && analytics.summary.dailyData.length > 0 ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'end', 
            gap: '8px', 
            height: '300px',
            padding: '20px 0',
            overflowX: 'auto'
          }}>
            {analytics.summary.dailyData.slice(-15).map((data, index) => {
              const maxRides = Math.max(...analytics.summary.dailyData.map(d => d.rides));
              const height = maxRides > 0 ? (data.rides / maxRides) * 250 : 10;
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  minWidth: '40px'
                }}>
                  <div 
                    title={`${new Date(data.date).toLocaleDateString()}: ${data.rides} rides, ₹${data.revenue}`}
                    style={{
                      width: '30px',
                      height: `${height}px`,
                      backgroundColor: '#667eea',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '10px',
                      cursor: 'pointer'
                    }}
                  ></div>
                  <p style={{ margin: '10px 0 0 0', fontSize: '10px', fontWeight: '600', transform: 'rotate(-45deg)' }}>
                    {new Date(data.date).getDate()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>
            <p>No daily data available. Generate analytics to see trends.</p>
          </div>
        )}
      </div>

      {/* Analytics Info */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>📊 Analytics Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Data Collection</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
              Analytics are automatically generated daily and stored in the database. 
              Click "Generate Analytics" to update with latest data.
            </p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Real-time Metrics</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
              Today's stats show live data including active drivers, total users, 
              rides completed today, and revenue generated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}