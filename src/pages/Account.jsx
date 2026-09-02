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
    fetchStats();
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
    </div>
  );
};

export default Account;
