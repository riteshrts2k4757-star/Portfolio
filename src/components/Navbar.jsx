import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">Portfolio</Link>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Chat</NavLink>
          <NavLink to="/tours" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Tours</NavLink>
          <NavLink to="/games" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Games</NavLink>
        </div>
      </div>
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user ? (
          <>
            <Link to="/account" className="user-profile-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-main)' }}>
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #646cff' }} />
              ) : (
                <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#646cff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="white" />
                </div>
              )}
              <span style={{ fontWeight: '600' }}>{user.username}</span>
              {user.role === 'admin' && <span style={{ fontSize: '0.7rem', background: 'var(--tour-primary)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Admin</span>}
              {user.role === 'tourguide' && <span style={{ fontSize: '0.7rem', background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Guide</span>}
            </Link>
            <button onClick={logout} className="btn btn-outline nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.8rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline nav-btn">Login</Link>
            <Link to="/signup" className="btn btn-primary nav-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
