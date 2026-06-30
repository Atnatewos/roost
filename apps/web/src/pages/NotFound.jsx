// apps/web/src/pages/NotFound.jsx

import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

/**
 * ROOST 404 Not Found Page.
 * Displayed when a user navigates to a non-existent route.
 * Provides clear navigation options to get back to the main site.
 * Never shows browser-default 404 pages.
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      {/* Large 404 code */}
      <span className="not-found__code">404</span>

      <h1 className="not-found__title">Page Not Found</h1>

      <p className="not-found__description">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      {/* Navigation options */}
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <Button variant="primary" onClick={() => navigate('/')}>
          Go Home
        </Button>
        <Button variant="outline" onClick={() => navigate('/search')}>
          Browse Spaces
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;