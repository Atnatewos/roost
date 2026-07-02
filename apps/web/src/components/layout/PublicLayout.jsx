// apps/web/src/components/layout/PublicLayout.jsx

/**
 * @file components/layout/PublicLayout.jsx
 * @description Public layout wrapper for all ROOST pages.
 * Provides consistent header, footer, and content area structure.
 * CRITICAL: Uses React Router's <Outlet /> to render nested child routes.
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const PublicLayout = () => {
  const layoutStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--color-background, #f9fafb)',
  };

  const mainStyle = {
    flex: 1,
    width: '100%',
  };

  return (
    <div className="public-layout" style={layoutStyle}>
      <Header />
      <main className="public-layout__main" style={mainStyle}>
        {/* Outlet injects the matched child route (e.g., Home, Search, Login) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;