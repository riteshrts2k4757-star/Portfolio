import React from 'react';
import { LayoutDashboard, Users, Map as MapIcon, CalendarCheck, MessageSquare, CreditCard, Settings } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Guides', icon: Users },
    { id: 'tours', label: 'Tours', icon: MapIcon },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'payments', label: 'Demo Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-sidebar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <div
            key={tab.id}
            className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon size={20} />
            <span style={{ display: 'none' }} className="d-md-inline">{tab.label}</span>
            {/* Simple CSS to hide labels on mobile if needed, or flex handles it */}
            <span className="desktop-only-text" style={{ marginLeft: '0.5rem' }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AdminSidebar;
