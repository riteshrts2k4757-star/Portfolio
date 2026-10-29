import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import { ChevronDown, LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import './Navbar.css';

const sectionLinks = [
  { label: 'Home', id: 'home' },
  { label: 'What I Do', id: 'what-i-do' },
  { label: 'Projects', id: 'projects' },
  { label: 'Skills', id: 'skills' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' }
];

const secondaryLinks = [
  { label: 'Architecture / How I Build', to: '/#architecture' },
  { label: 'Tour booking app', to: '/tours' },
  { label: 'Real-time chat', to: '/chat' },
  { label: 'RC Pathfinder game', to: '/games' },
  { label: 'Contact form', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
  { label: 'GitHub profile', href: 'https://github.com/riteshrts2k4757-star' }
];

const accents = [
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' }
];

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, accent, setAccent, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const isHome = location.pathname === '/';
  const navContentRef = useRef(null);
  const menuToggleRef = useRef(null);
  const moreMenuRef = useRef(null);
  const moreTriggerRef = useRef(null);
  const sectionLinksRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    let frame = 0;
    const updateScrollState = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 24;
        setScrolled(current => current === nextScrolled ? current : nextScrolled);
        frame = 0;
      });
    };

    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isHome) return undefined;
    const sections = sectionLinks
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const updateActiveSection = () => {
      const marker = window.innerHeight * 0.36;
      let active = sections[0];
      sections.forEach(section => {
        if (section.getBoundingClientRect().top <= marker) active = section;
      });
      setActiveSection(active.id);
    };

    const observer = new IntersectionObserver(updateActiveSection, {
      rootMargin: '-15% 0px -65% 0px',
      threshold: [0, 0.1, 0.3]
    });
    sections.forEach(section => observer.observe(section));
    updateActiveSection();
    return () => observer.disconnect();
  }, [isHome]);

  useLayoutEffect(() => {
    const links = sectionLinksRef.current;
    if (!links || !isHome) {
      links?.style.setProperty('--active-width', '0px');
      return undefined;
    }

    const updateIndicator = () => {
      const activeLink = links.querySelector(`[data-section="${activeSection}"]`);
      if (!activeLink) {
        links.style.setProperty('--active-width', '0px');
        return;
      }
      const linksRect = links.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();
      links.style.setProperty('--active-left', `${activeRect.left - linksRect.left}px`);
      links.style.setProperty('--active-width', `${activeRect.width}px`);
    };

    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(links);
    return () => observer.disconnect();
  }, [activeSection, isHome]);

  useEffect(() => {
    if (!menuOpen && !moreOpen) return undefined;

    const handlePointerDown = (event) => {
      if (moreOpen && !moreMenuRef.current?.contains(event.target)) {
        setMoreOpen(false);
      }
      if (
        menuOpen &&
        !navContentRef.current?.contains(event.target) &&
        !menuToggleRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (moreOpen) {
        setMoreOpen(false);
        moreTriggerRef.current?.focus();
      }
      if (menuOpen) {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen, moreOpen]);

  const sectionHref = (id) => isHome ? `#${id}` : `/#${id}`;
  const closeMenus = () => {
    setMenuOpen(false);
    setMoreOpen(false);
  };
  const renderSecondaryLink = ({ label, to, href }) => (
    to
      ? <Link key={label} to={to} onClick={closeMenus}>{label}</Link>
      : <a key={label} href={href} target="_blank" rel="noreferrer" onClick={closeMenus}>{label}</a>
  );

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="site-brand" to="/" onClick={closeMenus} aria-label="Ritesh Kumar Rana, home">
          <span className="brand-mark">R<span>.</span></span>
          <span className="brand-name">Ritesh Rana</span>
        </Link>

        <button
          ref={menuToggleRef}
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <div
          ref={navContentRef}
          className={`site-nav-content${menuOpen ? ' nav-open' : ''}`}
          id="primary-nav"
        >
          <div className={`site-nav-links${isHome ? ' is-home' : ''}`} ref={sectionLinksRef}>
            {sectionLinks.map(({ label, id }) => (
              <a
                key={id}
                href={sectionHref(id)}
                data-section={id}
                className={`site-nav-link${isHome && activeSection === id ? ' active' : ''}`}
                aria-current={isHome && activeSection === id ? 'location' : undefined}
                onClick={closeMenus}
              >
                {label}
              </a>
            ))}
            <span className="nav-active-indicator" aria-hidden="true" />
          </div>

          <div className="site-nav-mobile-apps" aria-label="More destinations">
            <span className="mobile-apps-label">Explore more</span>
            <div className="mobile-app-links">
              {secondaryLinks.map(renderSecondaryLink)}
            </div>
          </div>

          <div className="site-nav-tools">
            <div className="accent-picker" role="group" aria-label="Choose accent color">
              {accents.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`accent-swatch accent-${option.value}${accent === option.value ? ' selected' : ''}`}
                  aria-label={`${option.label} accent${accent === option.value ? ', selected' : ''}`}
                  aria-pressed={accent === option.value}
                  title={`${option.label} accent`}
                  onClick={() => setAccent(option.value)}
                />
              ))}
            </div>
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="nav-more" ref={moreMenuRef}>
              <button
                ref={moreTriggerRef}
                className={`nav-more-trigger${moreOpen ? ' is-open' : ''}`}
                type="button"
                aria-expanded={moreOpen}
                aria-controls="more-menu"
                onClick={() => setMoreOpen(open => !open)}
              >
                More <ChevronDown size={14} aria-hidden="true" />
              </button>
              <div
                className={`nav-more-menu${moreOpen ? ' is-open' : ''}`}
                id="more-menu"
                aria-label="More destinations"
                aria-hidden={!moreOpen}
              >
                {secondaryLinks.map(renderSecondaryLink)}
              </div>
            </div>

            {user ? (
              <div className="nav-account">
                <Link className="account-link" to="/account" onClick={closeMenus}>
                  {user.profile_picture ? <img src={user.profile_picture} alt="" /> : <span className="account-avatar"><User size={15} /></span>}
                  <span>{user.username}</span>
                </Link>
                <button
                  className="logout-button"
                  type="button"
                  onClick={() => { logout(); closeMenus(); }}
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link className="nav-signin" to="/login" onClick={closeMenus}>Sign in</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
