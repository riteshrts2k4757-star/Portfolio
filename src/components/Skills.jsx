import React from 'react';

const Skills = () => {
  const skills = {
    "Languages": ["Python", "C++", "C", "Java", "JavaScript"],
    "Web Dev": ["HTML", "CSS/SCSS", "React.js", "Node.js", "Express.js"],
    "Database": ["MongoDB", "Firebase"],
    "Technologies": ["MERN Stack", "IoT (ESP32)"],
    "Tools": ["Git", "GitHub"]
  };

  return (
    <section className="skills-container glass-box">
      <h2 className="section-title">Skills</h2>
      <div className="skills-grid">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category} className="skill-category">
            <h3>{category}</h3>
            <div className="tags-container">
              {items.map(item => <span key={item} className="skill-tag">{item}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
