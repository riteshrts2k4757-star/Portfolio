import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

import AdminSidebar from '../Admin/components/AdminSidebar';
import AdminOverview from '../Admin/components/AdminOverview';
import AdminUsers from '../Admin/components/AdminUsers';
import AdminTours from '../Admin/components/AdminTours';
import AdminBookings from '../Admin/components/AdminBookings';
import AdminReviews from '../Admin/components/AdminReviews';

import '../../components/Tours/Tours.css';

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) return <div className="tours-page" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  // Protect Route
  if (!user || user.role !== 'admin') {
    return <Navigate to="/tours" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUsers />;
      case 'tours':
        return <AdminTours />;
      case 'bookings':
      case 'payments':
        return <AdminBookings />;
      case 'reviews':
        return <AdminReviews />;
      case 'settings':
        return (
          <div className="admin-header">
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>Settings</h1>
              <p style={{ color: 'var(--text-muted)' }}>Settings functionality coming soon.</p>
            </div>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="tours-page" style={{ padding: 0 }}>
      <div className="admin-layout">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
