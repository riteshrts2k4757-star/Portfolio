import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../apiConfig';
import { Search, Map as MapIcon, Plus, EyeOff, Eye, Trash2, Edit } from 'lucide-react';

const AdminTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      // Admin can see all tours using the guide endpoint which fetches all if role=admin
      const response = await fetch(`${API_BASE_URL}/api/tours/guide/my-tours`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTours(data.tours);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (tour) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tours/${tour.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !tour.is_active })
      });
      if (response.ok) {
        fetchTours();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id, reviewCount) => {
    if (reviewCount > 0) {
      alert("This tour has bookings/reviews and cannot be permanently deleted. Please deactivate it instead.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to permanently delete this tour? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tours/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTours();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTours = tours.filter(t => 
    t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Tour Management</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage all active and inactive tours.</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.5rem', borderRadius: '12px',
          background: 'var(--tour-primary)', color: 'white', border: 'none',
          fontWeight: 'bold', cursor: 'pointer'
        }}>
          <Plus size={20} /> Add New Tour
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search tours..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.5rem 1rem 0.5rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-color)',
                color: 'var(--text-main)',
                width: '300px'
              }}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tour</th>
                <th>Location</th>
                <th>Price</th>
                <th>Guide ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign:'center'}}>Loading...</td></tr>
              ) : filteredTours.map(t => (
                <tr key={t.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '500' }}>
                    <img src={t.image_url} alt="Tour" style={{ width: 60, height: 40, borderRadius: '8px', objectFit: 'cover' }} />
                    {t.title}
                  </td>
                  <td>{t.location}</td>
                  <td>₹{t.price?.toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: '0.85rem' }}>{t.tour_guide_id ? `ID: ${t.tour_guide_id}` : 'Unassigned'}</td>
                  <td>
                    <span className={`admin-badge ${t.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn-icon" title="Edit Tour">
                        <Edit size={18} />
                      </button>
                      <button className="admin-btn-icon" title={t.is_active ? "Deactivate Tour" : "Reactivate Tour"} onClick={() => toggleActive(t)}>
                        {t.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button className="admin-btn-icon danger" title="Delete Permanently" onClick={() => handleDelete(t.id, t.review_count)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTours.length === 0 && !loading && (
                <tr><td colSpan="6" style={{textAlign:'center'}}>No tours found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTours;
