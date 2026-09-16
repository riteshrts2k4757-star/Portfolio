import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../apiConfig';
import { Map as MapIcon, Users, PlusCircle } from 'lucide-react';
import '../../components/Tours/Tours.css';

const GuideDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'tourguide') {
      fetchTours();
    }
  }, [user]);

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/tours/guide/my-tours`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTours(data.tours);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'tourguide') {
    return <div className="tours-page"><div className="empty-state">Unauthorized Access</div></div>;
  }

  return (
    <div className="tours-page" style={{ padding: '2rem 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Users size={32} color="var(--tour-primary)" />
            <h1 style={{ margin: 0 }}>Guide Dashboard</h1>
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Add New Tour
          </button>
        </div>

        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>My Assigned Tours</h2>
        
        {loading ? (
          <div>Loading tours...</div>
        ) : tours.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {tours.map(tour => (
              <div key={tour.id} style={{ background: 'var(--tour-surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--tour-border)' }}>
                <img src={tour.image_url} alt={tour.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{tour.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--tour-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <span>{tour.location}</span>
                    <span>{tour.duration_days} Days</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm w-100">Edit</button>
                    <button className="btn btn-primary btn-sm w-100">View Bookings</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <MapIcon size={48} />
            <p>You haven't been assigned any tours yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideDashboard;
