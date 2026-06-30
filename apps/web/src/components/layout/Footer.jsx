// apps/web/src/components/layout/Footer.jsx

import { Link } from 'react-router-dom';
import { appConfig } from '@roost/config';

/**
 * ROOST global footer.
 * Displays branding, navigation links, and copyright information.
 * Present on all public pages.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* Brand column */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            {appConfig.brand.name}
          </Link>
          <p className="footer__tagline">{appConfig.brand.tagline}</p>
        </div>

        {/* Navigation columns */}
        <div className="footer__links">
          <div className="footer__column">
            <h4 className="footer__column-title">Explore</h4>
            <Link to="/search" className="footer__link">Browse Spaces</Link>
            <Link to="/search?city=Addis+Ababa" className="footer__link">Addis Ababa</Link>
            <Link to="/become-host" className="footer__link">Become a Host</Link>
          </div>

          <div className="footer__column">
            <h4 className="footer__column-title">Company</h4>
            <Link to="/about" className="footer__link">About ROOST</Link>
            <Link to="/help" className="footer__link">Help Center</Link>
            <a href={`mailto:${appConfig.brand.email}`} className="footer__link">Contact Us</a>
          </div>

          <div className="footer__column">
            <h4 className="footer__column-title">Legal</h4>
            <Link to="/privacy" className="footer__link">Privacy Policy</Link>
            <Link to="/terms" className="footer__link">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="footer__bottom">
        <div className="container">
          <p className="footer__copyright">
            &copy; {currentYear} {appConfig.brand.fullName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;