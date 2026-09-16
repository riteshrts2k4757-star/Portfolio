import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found in URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Verification failed. The link might be expired.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Network error. Please try again later.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        
        {status === 'verifying' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={50} color="var(--accent-1)" style={{ animation: 'spin 1s linear infinite' }} />
            <h2 style={{ color: 'var(--text-main)' }}>Verifying Email...</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '15px' }}>
              <CheckCircle size={50} color="#16a34a" />
            </div>
            <h2 style={{ color: 'var(--text-main)', marginTop: '10px' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Thank you! Your account has been successfully created. You can now log in to access all features.
            </p>
            <button className="auth-btn-premium" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#fee2e2', borderRadius: '50%', padding: '15px' }}>
              <XCircle size={50} color="#dc2626" />
            </div>
            <h2 style={{ color: 'var(--text-main)', marginTop: '10px' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{errorMessage}</p>
            <button className="auth-btn-premium" onClick={() => navigate('/signup')} style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid #d1d5db' }}>
              Back to Sign Up
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
