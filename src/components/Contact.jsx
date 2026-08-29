import React from 'react';

const Contact = () => {
  return (
    <section className="contact-container glass-box">
      <h2 className="section-title">Contact</h2>
      <div className="contact-info">
        <div className="contact-item">
          <div className="contact-icon">📱</div>
          <div className="contact-details">
            <p>Phone</p>
            <span>7979072406</span>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon">📧</div>
          <div className="contact-details">
            <p>Email</p>
            <a href="mailto:riteshrana2k4@gmail.com">riteshrana2k4@gmail.com</a>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon">📍</div>
          <div className="contact-details">
            <p>Location</p>
            <span>Jhumri Telaiya, 825409</span>
          </div>
        </div>
        <div className="contact-item">
          <div className="contact-icon">🔗</div>
          <div className="contact-details">
            <p>GitHub</p>
            <a href="https://github.com/riteshrts2k4757-star" target="_blank" rel="noreferrer">
              github.com/riteshrts2k4757-star
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
