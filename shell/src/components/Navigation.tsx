import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/dashboard" className="brand-link" onClick={handleLinkClick}>
            🏢 <span>Modular People Portal</span>
          </Link>
        </div>
        
        {/* Hamburger menu button */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`nav-content ${isMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              📊 <span>Dashboard</span>
            </Link>
            <Link 
              to="/directory" 
              className={`nav-link ${isActive('/directory') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              👥 <span>Directory</span>
            </Link>
            <Link 
              to="/memory-game" 
              className={`nav-link ${isActive('/memory-game') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              🎮 <span>Memory Game</span>
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              👤 <span>Profile</span>
            </Link>
          </div>

          <div className="nav-user">
            <div className="user-info">
              <img 
                src={user?.image || '/api/placeholder/32/32'} 
                alt={user?.firstName} 
                className="user-avatar"
              />
              <span className="user-name">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
