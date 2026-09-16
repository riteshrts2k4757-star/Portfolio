import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Activity, Star, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../apiConfig';
import '../../components/Tours/Tours.css';

const TourDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tours/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTour(data.tour);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to fetch tour', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [id]);

  if (loading) {
    return <div className="tours-page"><div className="empty-state">Loading tour details...</div></div>;
  }

  if (!tour) {
    return <div className="tours-page"><div className="empty-state">Tour not found</div></div>;
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} fill={i < Math.round(rating) ? '#fbbf24' : 'none'} color={i < Math.round(rating) ? '#fbbf24' : '#cbd5e1'} />
    ));
  };

  return (
    <div className="tours-page">
      <div className="tour-details-page">
        {/* HERO IMAGE */}
        <div className="tour-gallery-hero">
          <img src={tour.image_url} alt={tour.title} />
        </div>

        <div className="tour-info-layout">
          {/* MAIN CONTENT */}
          <div className="tour-main-content">
            <h1>{tour.title}</h1>
            
            <div className="tour-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={18} /> {tour.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fbbf24', fontWeight: 'bold' }}>
                {tour.rating} {renderStars(tour.rating)} ({tour.review_count} reviews)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', color: 'var(--tour-primary)' }}><Clock size={24} /></div>
                <div><div style={{ fontSize: '0.8rem', color: 'var(--tour-text-muted)' }}>Duration</div><div style={{ fontWeight: 'bold' }}>{tour.duration_days} Days</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', color: 'var(--tour-primary)' }}><Activity size={24} /></div>
                <div><div style={{ fontSize: '0.8rem', color: 'var(--tour-text-muted)' }}>Difficulty</div><div style={{ fontWeight: 'bold' }}>{tour.difficulty}</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', color: 'var(--tour-primary)' }}><Users size={24} /></div>
                <div><div style={{ fontSize: '0.8rem', color: 'var(--tour-text-muted)' }}>Group Size</div><div style={{ fontWeight: 'bold' }}>Max {tour.max_group_size}</div></div>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About this tour</h2>
              <p style={{ lineHeight: '1.6', color: 'var(--tour-text-muted)' }}>{tour.description}</p>
            </div>
            
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Itinerary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tour.itinerary.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1.5rem', background: 'var(--tour-surface-alt)', padding: '1.5rem', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tour-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {item.day}
                        </div>
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h3>
                        <p style={{ color: 'var(--tour-text-muted)', margin: 0 }}>{item.description || 'Activity details'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Customer Reviews</h2>
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ borderBottom: '1px solid var(--tour-border)', paddingBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', overflow: 'hidden' }}>
                          {review.users?.profile_picture ? <img src={review.users.profile_picture} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{review.users?.username || 'Traveler'}</div>
                          <div style={{ display: 'flex', color: '#fbbf24' }}>{renderStars(review.rating)}</div>
                        </div>
                      </div>
                      <p style={{ color: 'var(--tour-text-muted)', margin: 0 }}>"{review.review_text}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--tour-text-muted)' }}>No reviews yet.</p>
              )}
            </div>
          </div>

          {/* SIDEBAR WIDGET */}
          <div>
            <div className="tour-booking-widget">
              <div className="tour-widget-price">
                <span style={{ fontSize: '1rem', color: 'var(--tour-text-muted)', fontWeight: 'normal' }}>From </span>
                {tour.currency === 'INR' ? '₹' : tour.currency}{Number(tour.price).toLocaleString('en-IN')}
                <span style={{ fontSize: '1rem', color: 'var(--tour-text-muted)', fontWeight: 'normal' }}> / person</span>
              </div>
              
              <button 
                className="btn btn-primary btn-lg w-100" 
                style={{ marginBottom: '1.5rem' }}
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { redirectTo: `/tours/${id}/book` } });
                  } else {
                    navigate(`/tours/${id}/book`);
                  }
                }}
              >
                Book This Tour
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--tour-primary)" /> Free cancellation up to 48 hours</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--tour-primary)" /> Expert local guide</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle size={18} color="var(--tour-primary)" /> All taxes included</div>
              </div>

              {tour.users && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--tour-border)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--tour-text-muted)', marginBottom: '0.5rem' }}>Tour Guide</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden' }}>
                      {tour.users.profile_picture ? <img src={tour.users.profile_picture} alt="Guide" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>{tour.users.username}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
