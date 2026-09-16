import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../apiConfig';
import { Users, Map as MapIcon, CalendarCheck, IndianRupee } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGuides: 0,
    totalTours: 0,
    totalBookings: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Welcome to the admin control panel.</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-title">Total Users</span>
            <Users size={24} color="var(--tour-primary)" />
          </div>
          <span className="admin-stat-value">{stats.totalUsers}</span>
        </div>
        
        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-title">Tour Guides</span>
            <Users size={24} color="#f59e0b" />
          </div>
          <span className="admin-stat-value">{stats.totalGuides}</span>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-title">Active Tours</span>
            <MapIcon size={24} color="#3b82f6" />
          </div>
          <span className="admin-stat-value">{stats.totalTours}</span>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-title">Total Bookings</span>
            <CalendarCheck size={24} color="#10b981" />
          </div>
          <span className="admin-stat-value">{stats.totalBookings}</span>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-title">Demo Revenue</span>
            <IndianRupee size={24} color="#8b5cf6" />
          </div>
          <span className="admin-stat-value">₹{stats.revenue.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
