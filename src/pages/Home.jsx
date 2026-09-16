import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';

const Home = () => {
  return (
    <div style={{ marginTop: '-5rem', display: 'flex', flexDirection: 'column' }}>
      <div className="home-top-bar" style={{ padding: '0.8rem 5%', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(240, 253, 244, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)', zIndex: 10, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '30px', padding: '0.5rem 1.5rem', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search features, games, tours..." 
            style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0.25rem 0.5rem', width: '100%', color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontSize: '1rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/contact" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '30px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500', transition: 'all 0.2s' }}>
            <MessageSquare size={18} color="var(--accent-2)" />
            <span>Contact Us</span>
          </Link>
          <Link to="/faq" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '30px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500', transition: 'all 0.2s' }}>
            <HelpCircle size={18} color="var(--accent-2)" />
            <span>Need Help?</span>
          </Link>
        </div>
      </div>

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
    </div>
  );
};

export default Home;
