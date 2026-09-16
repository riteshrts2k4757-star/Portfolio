import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-container glass-box">
      <div className="footer-content-wide">
        
        {/* Explore / About */}
        <div className="footer-section-wide">
          <h4>Explore</h4>
          <p style={{ fontSize: '0.9rem', maxWidth: '250px' }}>
            Feel free to reach out for collaborations or just a friendly hello. Discover the world's most beautiful destinations with our premium, hand-crafted tour experiences.
          </p>
        </div>

        {/* Discover */}
        <div className="footer-section-wide">
          <h4>Discover</h4>
          <div className="footer-links-grid-wide">
            <Link to="/tours">Seasonal and holiday deals</Link>
            <Link to="#">Travel articles</Link>
            <Link to="#">Traveller Review Awards</Link>
            <Link to="#">Flight finder</Link>
            <Link to="#">Restaurant reservations</Link>
          </div>
        </div>

        {/* Terms and settings */}
        <div className="footer-section-wide">
          <h4>Terms and settings</h4>
          <div className="footer-links-grid-wide">
            <Link to="#">Privacy Notice</Link>
            <Link to="#">Terms of Service</Link>
            <Link to="#">Accessibility Statement</Link>
            <Link to="#">Grievance officer</Link>
            <Link to="#">Cookie Policy</Link>
          </div>
        </div>

        {/* Partners */}
        <div className="footer-section-wide">
          <h4>Partners</h4>
          <div className="footer-links-grid-wide">
            <Link to="/admin">Extranet login</Link>
            <Link to="#">Partner help</Link>
            <Link to="#">List your property</Link>
            <Link to="#">Become an affiliate</Link>
          </div>
        </div>

        {/* Contact Us */}
        <div className="footer-section-wide contact-details-footer">
          <h4>Contact Us</h4>
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
      
      <div className="footer-bottom-wide">
        <div className="footer-locale">
          <img src="https://flagcdn.com/w20/in.png" alt="India Flag" style={{ width: 20, height: 14, borderRadius: 2 }} />
          <span style={{ fontWeight: 600 }}>INR</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Ritesh Kumar Rana. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
