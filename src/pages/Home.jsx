import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';

const Home = () => {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="left-column">
          <Skills />
        </div>
        <div className="right-column">
          <About />
          <div id="projects"><Projects /></div>
        </div>
      </main>
    </>
  );
};

export default Home;
