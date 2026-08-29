import React from 'react';
import nezukoImage from '../assets/Nezuko.jpg';

const Header = () => {
  return (
    <header className="header-container">
      <div className="header-text">
        <h1>Ritesh Kumar Rana</h1>
        <h2>B.Tech Student – Information Technology</h2>
        <div className="header-actions">
          <a href="#contact" className="btn btn-primary">Contact Me</a>
          <a href="#projects" className="btn btn-outline">View Projects</a>
        </div>
      </div>
      <div className="header-image-container">
        <img src={nezukoImage} alt="Profile" className="header-image" />
      </div>
    </header>
  );
};

export default Header;
