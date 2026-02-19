import React, { useState, useEffect } from 'react';
import './pages.css';

const API_BASE = 'http://localhost:5000/api';

function DashboardPage({ currentUser }) {
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      if (currentUser) {
        const sessionResponse = await fetch(`${API_BASE}/users/${currentUser.id}/sessions`);
        const sessionData = await sessionResponse.json();
        setSessions(Array.isArray(sessionData) ? sessionData : []);
      }

      const ownerEmail = localStorage.getItem('ownerEmail');
      if (ownerEmail) {
        const analyticsResponse = await fetch(`${API_BASE}/analytics/owner/${ownerEmail}`);
        const analyticsData = await analyticsResponse.json();
        setAnalytics(Array.isArray(analyticsData) ? analyticsData : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const getDashboardStats = () => {
    const activeCount = sessions.filter(s => s.status === 'active').length;
    const totalAmount = sessions
      .filter(s => s.status === 'completed' && s.amount_charged)
      .reduce((sum, s) => sum + s.amount_charged, 0);

    return {
      totalBookings: sessions.length,
      activeBookings: activeCount,
      totalSpent: totalAmount.toFixed(2),
    };
  };

  const stats = getDashboardStats();

  return (
    <div className="dashboard">
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>📊 Your Dashboard</h1>

        {currentUser && (
          <div className="welcome-card">
            <h2>Welcome back, {currentUser.name}! 👋</h2>
            <p>Manage your parking bookings and track your activity</p>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-title">🚗 Total Bookings</div>
            <div className="dashboard-card-value">{stats.totalBookings}</div>
            <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              All time bookings
            </p>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-title">✅ Active Now</div>
            <div className="dashboard-card-value" style={{ color: '#10b981' }}>{stats.activeBookings}</div>
            <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              Currently active
            </p>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-title">💸 Total Spent</div>
            <div className="dashboard-card-value" style={{ color: '#f59e0b' }}>₹{stats.totalSpent}</div>
            <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              Parking expenses
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('sessions')}
          >
            🅿️ My Bookings
          </button>
          {analytics && analytics.length > 0 && (
            <button
              className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('analytics')}
            >
              📈 My Spaces Analytics
            </button>
          )}
        </div>

        {activeTab === 'sessions' && (
          <div className="card">
            <h2>Parking Sessions</h2>
            {sessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🅿️</div>
                <h3>No Parking Sessions</h3>
                <p>No parking sessions yet. Start booking parking spaces!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Vehicle</th>
                      <th>Duration</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td>{new Date(session.check_in_time).toLocaleDateString()}</td>
                        <td>
                          <strong>{session.address}</strong>
                          <br />
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {session.city}
                          </span>
                        </td>
                        <td>{session.vehicle_number}</td>
                        <td>
                          {session.duration_minutes 
                            ? `${Math.ceil(session.duration_minutes / 60)}h${Math.round(session.duration_minutes % 60)}m` 
                            : '-'}
                        </td>
                        <td style={{ fontWeight: 600, color: '#2563eb' }}>
                          ₹{session.amount_charged || '-'}
                        </td>
                        <td>
                          <span className={`session-status status-${session.status}`}>
                            {session.status === 'active' ? '🟢 Active' : session.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Your Parking Spaces</h2>
            {analytics.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📍</div>
                <h3>No Parking Spaces Listed</h3>
                <p>You haven't listed any parking spaces yet.</p>
              </div>
            ) : (
              <div className="dashboard-grid">
                {analytics.map((space) => (
                  <div key={space.spaceId} className="card">
                    <div className="dashboard-card-title">📍 {space.address}</div>
                    <div className="dashboard-card-value" style={{ color: '#10b981', fontSize: '2rem' }}>
                      ₹{space.totalRevenue.toFixed(0)}
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                      <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        📊 Completed Bookings: <strong>{space.completedSessions}</strong>
                      </p>
                      <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        💰 Avg Per Booking: <strong>₹{space.averageSessionPrice.toFixed(0)}</strong>
                      </p>
                      <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        🎯 City: <strong>{space.address.split(',')[0]}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
