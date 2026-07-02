// apps/web/src/components/layout/Header.jsx

/**
 * @file components/layout/Header.jsx
 * @description Navigation header with authentication-aware links.
 * Uses the project's custom CSS variable design system and BEM naming conventions
 * to ensure perfect styling without relying on external utility frameworks.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Design system styles using project CSS variables
  const styles = {
    header: {
      backgroundColor: 'var(--color-white, #ffffff)',
      borderBottom: '1px solid var(--color-gray-200, #e5e7eb)',
      boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      fontSize: 'var(--font-size-xl, 1.5rem)',
      fontWeight: 'var(--font-weight-bold, 700)',
      color: 'var(--color-primary, #2563eb)',
      textDecoration: 'none',
      letterSpacing: '-0.02em',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6, 1.5rem)',
    },
    link: {
      fontSize: 'var(--font-size-md, 1rem)',
      fontWeight: 'var(--font-weight-medium, 500)',
      color: 'var(--color-gray-700, #374151)',
      textDecoration: 'none',
      transition: 'color var(--transition-fast, 0.2s)',
    },
    mobileToggle: {
      display: 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 'var(--space-2, 0.5rem)',
      color: 'var(--color-gray-700, #374151)',
    },
    mobileMenu: {
      padding: 'var(--space-4, 1rem)',
      borderTop: '1px solid var(--color-gray-200, #e5e7eb)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4, 1rem)',
      backgroundColor: 'var(--color-white, #ffffff)',
    },
    divider: {
      color: 'var(--color-gray-300, #d1d5db)',
      margin: '0 var(--space-2, 0.5rem)',
    },
    userInfo: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      color: 'var(--color-gray-600, #4b5563)',
      fontWeight: 'var(--font-weight-medium, 500)',
    }
  };

  return (
    <header className="header" style={styles.header}>
      <div className="header__container" style={styles.container}>
        <Link to="/" className="header__logo" style={styles.logo}>
          ROOST
        </Link>

        <nav className="header__nav" style={styles.nav}>
          <Link to="/search" style={styles.link}>Search</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" style={styles.link}>My Bookings</Link>
              {user?.role === 'HOST' && (
                <>
                  <Link to="/create-listing" style={styles.link}>Create Listing</Link>
                  <Link to="/host/dashboard" style={styles.link}>Dashboard</Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard" style={styles.link}>Admin</Link>
              )}
              
              <span style={styles.divider}>|</span>
              <span style={styles.userInfo}>
                {user?.fullName || user?.email}
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          )}
        </nav>

        <button 
          className="header__mobile-toggle" 
          style={styles.mobileToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="header__mobile-menu" style={styles.mobileMenu}>
          <Link to="/search" style={styles.link} onClick={() => setIsMenuOpen(false)}>Search</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" style={styles.link} onClick={() => setIsMenuOpen(false)}>My Bookings</Link>
              {user?.role === 'HOST' && (
                <>
                  <Link to="/create-listing" style={styles.link} onClick={() => setIsMenuOpen(false)}>Create Listing</Link>
                  <Link to="/host/dashboard" style={styles.link} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                </>
              )}
              <Button variant="secondary" fullWidth onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link} onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Button variant="primary" fullWidth onClick={() => { navigate('/register'); setIsMenuOpen(false); }}>Sign Up</Button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;