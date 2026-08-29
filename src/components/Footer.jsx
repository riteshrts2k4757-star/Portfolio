import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-container glass-box">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Get in Touch</h3>
          <p>Feel free to reach out for collaborations or just a friendly hello. I'm always open to discussing new projects and opportunities.</p>
        </div>
        <div className="footer-section contact-details-footer">
          <div className="footer-contact-item">
            <span className="contact-icon">📱</span>
            <a href="tel:7979072406">7979072406</a>
          </div>
          <div className="footer-contact-item">
            <span className="contact-icon">📧</span>
            <a href="mailto:riteshrana2k4@gmail.com">riteshrana2k4@gmail.com</a>
          </div>
          <div className="footer-contact-item">
            <span className="contact-icon">📍</span>
            <span>Jhumri Telaiya, 825409</span>
          </div>
          <div className="footer-contact-item">
            <span className="contact-icon">🔗</span>
            <a href="https://github.com/riteshrts2k4757-star" target="_blank" rel="noreferrer">
              github.com/riteshrts2k4757-star
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ritesh Kumar Rana. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
