import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span style={{ fontSize: '1.8rem' }}>🚀</span> NexusPlan
      </Link>
      <div className="navbar-nav">
        <span className="nav-link" style={{ cursor: 'default' }}>
          Welcome, {user?.name}
        </span>
        <button className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
