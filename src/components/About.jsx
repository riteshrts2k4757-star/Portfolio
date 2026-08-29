import React from 'react';

const About = () => {
  return (
    <section className="about-container glass-box">
      <h2 className="section-title">Profile Summary</h2>
      <p>
        Motivated and detail-oriented B.Tech Information Technology student with
        strong skills in full-stack development (MERN) and IoT system integration.
        Passionate about building real-world applications that combine software and
        hardware to solve practical problems.
      </p>

      <h2 className="section-title" style={{ marginTop: '2rem' }}>Education</h2>
      <div className="education-item">
        <h3>B.Tech in Information Technology</h3>
        <p style={{ color: '#fff' }}>BIT Sindri, Dhanbad</p>
        <p>2024 – Present </p>
      </div>
    </section>
  );
};

export default About;
