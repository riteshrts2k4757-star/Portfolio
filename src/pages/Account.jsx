import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Camera, X, Edit2, Save, LogOut, Shield, Mail, KeyRound, Trophy, Target, Timer, Zap, Award, Clock, Gamepad2 } from 'lucide-react';
import AvatarEditor from 'react-avatar-editor';
import { API_BASE_URL } from '../apiConfig';

const Account = () => {
  const { user, logout, loading, fetchUser } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Picture edit state
  const [imageFile, setImageFile] = useState(null);
  const [scale, setScale] = useState(1);
  const editorRef = useRef(null);
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Game stats
  const [gameStats, setGameStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  
  // Review state
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, review_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open edit mode if redirected from forgot password
  useEffect(() => {
    if (location.state?.autoEditProfile && user) {
      setIsEditing(true);
      setFormData({
        username: user.username,
        email: user.email,
        password: '' // leave blank for new password
      });
      // Clear state so it doesn't reopen on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, user, navigate]);

  // Fetch game stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/game-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setGameStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch game stats:', err);
      }
    };
    
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/tours/bookings/my-bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };
    
    fetchStats();
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-loading">
          <div className="account-loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    setImageFile(file);
    setError('');
  };

  const handleSaveImage = async () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const base64String = canvas.toDataURL();
      setUploading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/auth/profile-picture`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ image: base64String })
        });
        if (response.ok) {
          await fetchUser();
          setImageFile(null);
          setSuccess('Profile picture updated!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError('Failed to upload image');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCancel = () => {
    setImageFile(null);
    setScale(1);
  };
  
  const handleEditClick = () => {
    if (isEditing) {
      setIsEditing(false);
      setError('');
    } else {
      setFormData({ username: user.username, email: user.email, password: '' });
      setIsEditing(true);
      setError('');
      setSuccess('');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        await fetchUser();
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/tours/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tour_id: reviewingBooking.tour_id,
          booking_id: reviewingBooking.id,
          rating: parseInt(reviewData.rating),
          review_text: reviewData.review_text
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess('Review submitted successfully!');
        setReviewingBooking(null);
        setReviewData({ rating: 5, review_text: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="account-page">
      {/* Page Header */}
      <div className="account-page-header">
        <h1>My Account</h1>
        <p>Manage your profile and account settings</p>
      </div>

      {/* Notification Messages */}
      {error && <div className="account-msg account-msg-error">{error}</div>}
      {success && <div className="account-msg account-msg-success">{success}</div>}

      {/* Main Content */}
      <div className="account-layout">
        {/* Left Side - Profile & Avatar */}
        <div className="account-left-column">
          <div className="account-card account-avatar-card">
          <div className="account-card-header">
            <h2><Camera size={20} /> Your Avatar</h2>
          </div>
          
          <div className="account-avatar-wrapper">
            <div className="account-avatar-ring">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="account-avatar-img" />
              ) : (
                <div className="account-avatar-placeholder">
                  <User size={100} />
                </div>
              )}
            </div>
            
            <label className="account-camera-btn">
              <Camera size={22} color="white" />
              <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
            </label>
          </div>
          
          <p className="account-avatar-hint">
            {uploading ? 'Uploading...' : 'Click the camera to change your picture'}
          </p>

          <div className="account-member-since">
            <p>Member since</p>
            <span>{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          </div>
          
          {/* Account Details */}
          <div className="account-card account-details-card">
          <div className="account-card-header">
            <h2><Shield size={20} /> Account Details</h2>
            <button onClick={handleEditClick} className="account-edit-btn">
              {isEditing ? <><X size={16}/> Cancel</> : <><Edit2 size={16}/> Edit</>}
            </button>
          </div>

          {!isEditing ? (
            <div className="account-info-list">
              <div className="account-info-item">
                <div className="account-info-icon"><User size={18} /></div>
                <div className="account-info-content">
                  <span className="account-info-label">Name</span>
                  <span className="account-info-value">{user.username}</span>
                </div>
              </div>
              
              <div className="account-info-item">
                <div className="account-info-icon"><Mail size={18} /></div>
                <div className="account-info-content">
                  <span className="account-info-label">Email</span>
                  <span className="account-info-value">{user.email}</span>
                </div>
              </div>
              
              <div className="account-info-item">
                <div className="account-info-icon"><KeyRound size={18} /></div>
                <div className="account-info-content">
                  <span className="account-info-label">Password</span>
                  <span className="account-info-value">••••••••</span>
                </div>
              </div>

              <div className="account-info-item account-info-item-muted">
                <div className="account-info-icon"><Shield size={18} /></div>
                <div className="account-info-content">
                  <span className="account-info-label">Player ID</span>
                  <span className="account-info-value account-player-id">{user.player_id}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="account-edit-form">
              <div className="account-form-group">
                <label>Name</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="account-form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="account-form-group">
                <label>New Password <span className="account-form-hint">(leave blank to keep current)</span></label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
              </div>
              <button type="submit" className="account-save-btn" disabled={savingProfile}>
                <Save size={18} />
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          <button onClick={handleLogout} className="account-logout-btn">
            <LogOut size={18} />
            Log Out
          </button>

          {user.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="btn btn-outline" style={{ width: '100%', marginTop: '1rem', borderColor: 'var(--tour-primary)', color: 'var(--tour-primary)' }}>
              Go to Admin Dashboard
            </button>
          )}
          {user.role === 'tourguide' && (
            <button onClick={() => navigate('/guide/dashboard')} className="btn btn-outline" style={{ width: '100%', marginTop: '1rem', borderColor: 'var(--tour-primary)', color: 'var(--tour-primary)' }}>
              Go to Guide Dashboard
            </button>
          )}
          </div>
        </div>

        {/* Shadow Partition */}
        <div className="account-partition"></div>

        {/* Right Side - Game Stats */}
        <div className="account-right-column">
          <div className="account-stats-section">
        <h2 className="account-stats-title"><Gamepad2 size={22} /> Game Statistics</h2>
        {gameStats ? (
          <div className="account-stats-grid">
            <div className="account-stat-card account-stat-highlight">
              <div className="account-stat-icon"><Trophy size={22} /></div>
              <div className="account-stat-value">{gameStats.high_score}</div>
              <div className="account-stat-label">High Score</div>
            </div>
            <div className="account-stat-card">
              <div className="account-stat-icon"><Target size={22} /></div>
              <div className="account-stat-value">{gameStats.previous_score}</div>
              <div className="account-stat-label">Previous Score</div>
            </div>
            <div className="account-stat-card">
              <div className="account-stat-icon"><Gamepad2 size={22} /></div>
              <div className="account-stat-value">{gameStats.games_played}</div>
              <div className="account-stat-label">Games Played</div>
            </div>
            <div className="account-stat-card">
              <div className="account-stat-icon"><Zap size={22} /></div>
              <div className="account-stat-value">{gameStats.total_collisions}</div>
              <div className="account-stat-label">Total Collisions</div>
            </div>
            <div className="account-stat-card account-stat-highlight">
              <div className="account-stat-icon"><Award size={22} /></div>
              <div className="account-stat-value account-stat-rank">{gameStats.best_rank}</div>
              <div className="account-stat-label">Best Rank</div>
            </div>
            <div className="account-stat-card">
              <div className="account-stat-icon"><Timer size={22} /></div>
              <div className="account-stat-value">{gameStats.best_time > 0 ? `${gameStats.best_time.toFixed(1)}s` : '—'}</div>
              <div className="account-stat-label">Best Time</div>
            </div>
            <div className="account-stat-card">
              <div className="account-stat-icon"><Clock size={22} /></div>
              <div className="account-stat-value">{gameStats.total_play_time > 60 ? `${(gameStats.total_play_time / 60).toFixed(1)}m` : `${gameStats.total_play_time.toFixed(0)}s`}</div>
              <div className="account-stat-label">Total Play Time</div>
            </div>
          </div>
        ) : (
          <div className="account-stats-empty">
            <Gamepad2 size={40} />
            <p>No game data yet. Play RC Pathfinder to see your stats!</p>
          </div>
        )}
          </div>
          
          {/* My Tours / Bookings */}
          <div className="account-stats-section" style={{ marginTop: '2rem' }}>
            <h2 className="account-stats-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              My Tours
            </h2>
            
            {bookings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(booking => (
                  <div key={booking.id} style={{ display: 'flex', gap: '1rem', background: 'var(--tour-surface-alt)', border: '1px solid var(--tour-border)', borderRadius: '12px', padding: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={booking.tours?.image_url} alt="Tour" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0' }}>{booking.tours?.title}</h4>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--tour-text-muted)' }}>{booking.tour_date} • {booking.number_of_people} people</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: booking.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: booking.payment_status === 'paid' ? 'var(--tour-primary)' : '#f59e0b' }}>
                          {booking.payment_status.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                          {booking.booking_status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button onClick={() => navigate(`/tours/${booking.tour_id}`)} className="btn btn-outline btn-sm">View Tour</button>
                      {(booking.payment_status === 'paid' || booking.booking_status === 'confirmed' || booking.booking_status === 'completed') && (
                        <button 
                          onClick={() => setReviewingBooking(booking)} 
                          className="btn btn-primary btn-sm" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          Add Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="account-stats-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <p>No tours booked yet. Explore our destinations!</p>
                <button onClick={() => navigate('/tours')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Explore Tours</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resize Modal */}
      {imageFile && (
        <div className="account-modal-overlay">
          <div className="account-modal">
            <button onClick={handleCancel} className="account-modal-close">
              <X size={24} />
            </button>
            <h3>Resize & Crop</h3>
            
            <div className="account-modal-editor">
              <AvatarEditor
                ref={editorRef}
                image={imageFile}
                width={220}
                height={220}
                border={25}
                borderRadius={110}
                color={[0, 0, 0, 0.4]}
                scale={scale}
                rotate={0}
              />
            </div>
            
            <div className="account-modal-zoom">
              <span>Zoom</span>
              <input 
                type="range" 
                value={scale} 
                min="1" 
                max="3" 
                step="0.05" 
                onChange={(e) => setScale(parseFloat(e.target.value))} 
              />
            </div>

            <div className="account-modal-actions">
              <button className="btn btn-outline" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveImage} disabled={uploading}>
                {uploading ? 'Saving...' : 'Save Picture'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="account-modal-overlay">
          <div className="account-modal" style={{ maxWidth: '500px', width: '90%' }}>
            <button onClick={() => setReviewingBooking(null)} className="account-modal-close">
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Review Your Experience</h3>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              How was your trip to <strong>{reviewingBooking.tours?.title}</strong>?
            </div>
            
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600' }}>Rating (1-5)</label>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  {[1,2,3,4,5].map(num => (
                    <button 
                      type="button" 
                      key={num}
                      onClick={() => setReviewData({...reviewData, rating: num})}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: num <= reviewData.rating ? '#fbbf24' : 'var(--glass-border)'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600' }}>Your Review</label>
                <textarea 
                  required 
                  value={reviewData.review_text} 
                  onChange={e => setReviewData({...reviewData, review_text: e.target.value})}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    border: '1px solid var(--glass-border)', 
                    background: 'var(--glass-bg)',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                  placeholder="Tell us what you liked (or didn't like)..."
                ></textarea>
              </div>

              <div className="account-modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setReviewingBooking(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
