import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.token);
        navigate('/account');
      } else {
        setError(data.error || 'Registration failed');
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
          <h2>Create Account</h2>
          <p>Join us and claim your Player ID</p>
        </div>

        {error && <p style={{color: '#ef4444', marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem'}}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <User size={18} className="auth-input-icon" />
            <input 
              type="text" 
              name="username" 
              placeholder="Full Name or Username" 
              className="auth-input-premium" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>
          
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

          <div className="auth-input-group">
            <Lock size={18} className="auth-input-icon" />
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              className="auth-input-premium" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <button type="submit" className="auth-btn-premium" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
