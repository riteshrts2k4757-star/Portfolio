import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Loader2, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      setStatus('error');
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="contact-page-wrapper">
      {/* Decorative Blobs */}
      <div className="contact-blob-1"></div>
      <div className="contact-blob-2"></div>

      <div className="contact-header">
        <h1>Contact Us</h1>
        <h2>We'd love to hear from you</h2>
      </div>

      <div className="contact-grid">
        {/* Contact Info Column */}
        <div className="contact-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: '700' }}>Get in Touch</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
            Have questions about our tours, games, or features? Send us a message and our team will get back to you within 24 hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            
            <div className="contact-info-item">
              <div className="contact-icon-box">
                <Mail size={24} />
              </div>
              <div className="contact-info-text">
                <h4>Email</h4>
                <p>riteshrana2k4@gmail.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon-box">
                <Phone size={24} />
              </div>
              <div className="contact-info-text">
                <h4>Phone</h4>
                <p>7979072406</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon-box">
                <MapPin size={24} />
              </div>
              <div className="contact-info-text">
                <h4>Office</h4>
                <p>student at bit sindri</p>
              </div>
            </div>

          </div>
        </div>

        {/* Contact Form Column */}
        <div className="contact-glass-card">
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-1)' }}>
                <CheckCircle size={40} />
              </div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Message Sent!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Thank you for reaching out. We have received your message and will respond shortly.
              </p>
              <button className="contact-submit-btn" onClick={() => setStatus('idle')}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.8rem', margin: '0 0 20px 0', color: 'var(--text-main)', fontWeight: '700' }}>Send a Message</h3>
              
              {status === 'error' && (
                <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px 15px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500' }}>
                  {errorMessage}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label>Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="contact-input" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="contact-input" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  required 
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})} 
                  className="contact-input" 
                  placeholder="How can we help?" 
                />
              </div>

              <div className="input-group">
                <label>Message</label>
                <textarea 
                  required 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  className="contact-input" 
                  rows="5" 
                  placeholder="Write your message here..." 
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-btn" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <><Loader2 size={20} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                ) : (
                  <><Send size={20} /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
