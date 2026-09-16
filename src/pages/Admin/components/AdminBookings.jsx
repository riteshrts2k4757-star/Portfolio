import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../apiConfig';
import { Search, CheckCircle, XCircle } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tours/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, booking_status) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${booking_status}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ booking_status })
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.id.toLowerCase().includes(search.toLowerCase()) || 
    b.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
    b.tours?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Demo Payments & Bookings</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage customer reservations and dummy payment statuses.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by ID, User, or Tour..." 
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
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Tour</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{textAlign:'center'}}>Loading...</td></tr>
              ) : filteredBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 'bold' }}>#{b.id.substring(0,8).toUpperCase()}</td>
                  <td>{b.users?.email}</td>
                  <td>{b.tours?.title}</td>
                  <td>₹{b.total_amount?.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`admin-badge ${b.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${
                      b.booking_status === 'confirmed' || b.booking_status === 'completed' ? 'badge-success' : 
                      b.booking_status === 'cancelled' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn-icon" title="Mark Completed" onClick={() => handleUpdateStatus(b.id, 'completed')}>
                        <CheckCircle size={18} />
                      </button>
                      <button className="admin-btn-icon danger" title="Cancel Booking" onClick={() => handleUpdateStatus(b.id, 'cancelled')}>
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && !loading && (
                <tr><td colSpan="7" style={{textAlign:'center'}}>No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
