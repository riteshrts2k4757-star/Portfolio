import { ArrowUp, Code2, Mail } from 'lucide-react';
import './Footer.css';

const footerLinks = [
  { label: 'What I Do', id: 'what-i-do' },
  { label: 'Projects', id: 'projects' },
  { label: 'Skills', id: 'skills' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' }
];

function Footer() {
  const homeLink = (id) => window.location.pathname === '/' ? `#${id}` : `/#${id}`;

  return (
    <footer className="portfolio-footer">
      <div className="footer-main">
        <div className="footer-identity">
          <a className="footer-name" href={homeLink('home')}>Ritesh Kumar Rana<span>.</span></a>
          <p>Building across software, connected devices, and applied intelligence.</p>
        </div>
        <div className="footer-navigation">
          <h2>Explore</h2>
          <div>{footerLinks.map(link => <a key={link.id} href={homeLink(link.id)}>{link.label}</a>)}</div>
        </div>
        <div className="footer-connect">
          <h2>Connect</h2>
          <a href="mailto:riteshrana2k4@gmail.com"><Mail size={15} /> Email me</a>
          <a href="https://github.com/riteshrts2k4757-star" target="_blank" rel="noreferrer"><Code2 size={15} /> GitHub profile</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Ritesh Kumar Rana</span>
        <span>Designed to connect the dots.</span>
        <a href={homeLink('home')} className="back-to-top">Back to top <ArrowUp size={14} /></a>
      </div>
    </footer>
  );
}

export default Footer;
