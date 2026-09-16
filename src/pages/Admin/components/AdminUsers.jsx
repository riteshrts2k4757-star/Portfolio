import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../apiConfig';
import { Search, UserCog, Trash2, Shield, User } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'promote', 'demote', 'delete'
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '';
      let method = '';
      let body = null;

      if (modalAction === 'delete') {
        url = `${API_BASE_URL}/api/admin/users/${selectedUser.id}`;
        method = 'DELETE';
      } else if (modalAction === 'promote') {
        url = `${API_BASE_URL}/api/admin/users/${selectedUser.id}/role`;
        method = 'PUT';
        body = JSON.stringify({ role: 'tourguide' });
      } else if (modalAction === 'demote') {
        url = `${API_BASE_URL}/api/admin/users/${selectedUser.id}/role`;
        method = 'PUT';
        body = JSON.stringify({ role: 'user' });
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (response.ok) {
        setModalOpen(false);
        fetchUsers(); // refresh list
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username?.toLowerCase().includes(search.toLowerCase()) || 
                          u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage users and tour guides.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '0.5rem 1rem 0.5rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-main)',
                  width: '250px'
                }}
              />
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-color)',
                color: 'var(--text-main)'
              }}
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="tourguide">Tour Guides</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{textAlign:'center'}}>Loading...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '500' }}>
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt="Avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="var(--text-muted)" />
                      </div>
                    )}
                    {user.username}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-badge ${
                      user.role === 'admin' ? 'badge-danger' : 
                      user.role === 'tourguide' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      {user.role === 'user' && (
                        <button className="admin-btn-icon" title="Promote to Tour Guide" onClick={() => handleActionClick(user, 'promote')}>
                          <Shield size={18} />
                        </button>
                      )}
                      {user.role === 'tourguide' && (
                        <button className="admin-btn-icon" title="Remove Tour Guide Role" onClick={() => handleActionClick(user, 'demote')}>
                          <UserCog size={18} />
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button className="admin-btn-icon danger" title="Delete User" onClick={() => handleActionClick(user, 'delete')}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr><td colSpan="5" style={{textAlign:'center'}}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2 className="admin-modal-title">
              {modalAction === 'delete' ? 'Delete User?' : 
               modalAction === 'promote' ? 'Promote to Tour Guide?' : 
               'Remove Tour Guide Role?'}
            </h2>
            <div className="admin-modal-body">
              {modalAction === 'delete' && (
                <>
                  <p>Are you sure you want to permanently remove <strong>{selectedUser?.username}</strong> ({selectedUser?.email})?</p>
                  <p style={{ marginTop: '1rem', color: '#ef4444', fontWeight: 'bold' }}>This action cannot be undone. All associated bookings and reviews will be cascade deleted.</p>
                </>
              )}
              {modalAction === 'promote' && (
                <p>Are you sure you want to grant Tour Guide privileges to <strong>{selectedUser?.username}</strong>? They will be able to manage tours.</p>
              )}
              {modalAction === 'demote' && (
                <p>Are you sure you want to revoke Tour Guide privileges from <strong>{selectedUser?.username}</strong>? Existing tours assigned to this guide may need reassignment.</p>
              )}
            </div>
            <div className="admin-modal-actions">
              <button 
                onClick={() => setModalOpen(false)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: modalAction === 'delete' ? '#ef4444' : 'var(--tour-primary)', 
                  color: 'white', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {modalAction === 'delete' ? 'Delete Permanently' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
