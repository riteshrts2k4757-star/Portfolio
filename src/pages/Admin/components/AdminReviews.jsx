import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../apiConfig';
import { Search, Trash2, Star } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.tours?.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.review_text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Review Moderation</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Monitor and moderate customer reviews.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
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
                <th>Customer</th>
                <th>Tour</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign:'center'}}>Loading...</td></tr>
              ) : filteredReviews.map(r => (
                <tr key={r.id}>
                  <td>{r.users?.email}</td>
                  <td>{r.tours?.title}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 'bold' }}>
                      <Star size={16} fill="#f59e0b" />
                      {r.rating}/5
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.review_text}
                  </td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn-icon danger" title="Delete Review" onClick={() => handleDelete(r.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && !loading && (
                <tr><td colSpan="6" style={{textAlign:'center'}}>No reviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
