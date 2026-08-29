import React from 'react';

const Projects = () => {
  const projects = [
    {
      title: "BookYourTour (MERN Stack)",
      tags: ["MongoDB", "Express.js", "React.js", "Node.js"],
      description: "A full stack tour booking web application where users can explore destinations, book packages and manage their trips. Integrated user authentication, booking system and admin dashboard.",
      github: "github.com/riteshrts2k4757-star/BookYourTour"
    },
    {
      title: "Simple Banking Application",
      tags: ["HTML", "CSS", "JavaScript"],
      description: "Developed a web-based banking application that allows users to perform deposit, withdrawal and balance checking. Implemented transaction handling logic and real-time UI updates.",
      github: "github.com/riteshrts2k4757-star/aSimpleBankingWebsite.git"
    },
    {
      title: "Smart Water Tank Management System",
      tags: ["ESP32", "Ultrasonic Sensor", "Relay", "Web Dashboard"],
      description: "Designed and implemented an IoT based system to monitor water level in the tank in real-time. Automated motor ON/OFF using relay based on water level.",
      github: "github.com/Shreekant-Bharti/BeyondInfinity.git"
    },
    {
      title: "IoT-Based RC Plane Control",
      tags: ["React Native", "IoT", "Mobile App"],
      description: "Designed a mobile application to control an RC plane using wireless communication. Integrated app with embedded hardware for real-time commands and monitoring."
    }
  ];

  return (
    <section className="projects-container glass-box">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-card glass-box" style={{ padding: '1.5rem' }}>
            <h3>{project.title}</h3>
            <div className="project-tags">
              {project.tags.map(tag => (
                <span key={tag} className="project-tag">{tag}</span>
              ))}
            </div>
            <p>{project.description}</p>
            {project.github && (
              <div className="project-links">
                <a href={`https://${project.github}`} target="_blank" rel="noreferrer">
                  View Source ↗
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
