// apps/web/src/components/layout/Header.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { logoutUser } from '../../services/auth';
import { appConfig } from '@roost/config';
import Button from '../ui/Button';
import cn from '../../utils/cn';

/**
 * ROOST main navigation header.
 * Responsive: shows hamburger menu on mobile, full nav on desktop.
 * Adapts links based on user authentication and role.
 * Never uses browser-default navigation elements.
 */
const Header = () => {
  const { user, isAuth, isHost, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Handle user logout.
   * Clears auth state and redirects to home.
   */
  const handleLogout = () => {
    setMobileMenuOpen(false);
    logoutUser();
  };

  return (
    <header className="header">
      <div className="container header__inner">
        {/* Logo - Links to home */}
        <Link to="/" className="header__logo" onClick={() => setMobileMenuOpen(false)}>
          <span className="header__logo-text">{appConfig.brand.name}</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="header__nav" aria-label="Main navigation">
          <Link to="/search" className="header__nav-link">
            Browse Spaces
          </Link>

          {isHost && (
            <Link to="/host/dashboard" className="header__nav-link">
              Host Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="header__nav-link">
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop auth buttons */}
        <div className="header__actions">
          {isAuth ? (
            <>
              <Link to="/bookings" className="header__nav-link">
                My Bookings
              </Link>
              <div className="header__user-menu">
                <button className="header__user-btn" aria-label="User menu">
                  <span className="header__user-avatar">
                    {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </button>
                <div className="header__dropdown">
                  <span className="header__dropdown-name">{user?.fullName}</span>
                  <span className="header__dropdown-email">{user?.email}</span>
                  <hr className="header__dropdown-divider" />
                  <button
                    onClick={handleLogout}
                    className="header__dropdown-item header__dropdown-item--danger"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="header__auth-buttons">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="header__hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className={cn('header__hamburger-line', mobileMenuOpen && 'header__hamburger-line--open')} />
            <span className={cn('header__hamburger-line', mobileMenuOpen && 'header__hamburger-line--open')} />
            <span className={cn('header__hamburger-line', mobileMenuOpen && 'header__hamburger-line--open')} />
          </button>
        </div>
      </div>

      {/* Mobile navigation overlay */}
      {mobileMenuOpen && (
        <div className="header__mobile-menu">
          <nav className="header__mobile-nav" aria-label="Mobile navigation">
            <Link
              to="/search"
              className="header__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Spaces
            </Link>

            {isAuth ? (
              <>
                <Link
                  to="/bookings"
                  className="header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                {isHost && (
                  <Link
                    to="/host/dashboard"
                    className="header__mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Host Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="header__mobile-link header__mobile-link--danger">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;