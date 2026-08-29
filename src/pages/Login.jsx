import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = forgotPasswordMode ? '/api/auth/forgot-password' : '/api/auth/login';
      const payload = forgotPasswordMode ? { email: formData.email } : formData;

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.token);
        if (forgotPasswordMode) {
          navigate('/account', { state: { autoEditProfile: true } });
        } else {
          navigate('/account');
        }
      } else {
        setError(data.error || (forgotPasswordMode ? 'Failed to process forgot password' : 'Login failed'));
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{forgotPasswordMode ? 'Forgot Password' : 'Welcome Back'}</h2>
          <p>{forgotPasswordMode ? 'Enter your email to login and change your password' : 'Enter your details to access your account'}</p>
        </div>

        {error && <p style={{color: '#ef4444', marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem'}}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <Mail size={18} className="auth-input-icon" />
            <input 
              type="email" 
              name="email" 
              placeholder="Email address" 
              className="auth-input-premium" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          {!forgotPasswordMode && (
            <>
              <div className="auth-input-group">
                <Lock size={18} className="auth-input-icon" />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Password" 
                  className="auth-input-premium" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div style={{ textAlign: 'right', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setForgotPasswordMode(true); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-1)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}
          
          <button type="submit" className="auth-btn-premium" disabled={loading}>
            {loading ? 'Processing...' : (forgotPasswordMode ? 'Login & Change Password' : 'Sign In')}
          </button>
          
          {forgotPasswordMode && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => { setForgotPasswordMode(false); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Back to Login
              </button>
            </div>
          )}
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
