// apps/web/src/components/layout/PublicLayout.jsx

import Header from './Header';
import Footer from './Footer';

/**
 * Public layout wrapper for all ROOST pages.
 * Provides consistent header, footer, and content area structure.
 * Wrapped by providers in App.jsx for auth and toast access.
 */
const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Header />
      <main className="public-layout__main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;