// apps/web/src/pages/Home.jsx

/**
 * @file pages/Home.jsx
 * @description ROOST Home Page.
 * Landing page with hero search, property type categories,
 * and call-to-action sections. First impression for new visitors.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listingConfig, appConfig } from '@roost/config';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Navigate to search results page with the entered query.
   * Trims whitespace and ignores empty queries.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/search?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero__content">
          <h1 className="home-hero__title">
            {appConfig.brand.tagline}
          </h1>
          <p className="home-hero__subtitle">
            Discover unique homes, apartments, and traditional spaces across Ethiopia.
            Book securely with local payment methods.
          </p>
          
          {/* Search form */}
          <form className="home-hero__search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Where do you want to stay?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search destinations"
            />
            <Button type="submit" variant="primary" size="lg">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="container">
        <h2 className="section-title">Find Your Perfect Space</h2>
        <div className="property-grid">
          {listingConfig.propertyTypes.map((type) => (
            <Link
              key={type.id}
              to={`/search?propertyType=${type.id}`}
              className="property-card"
            >
              <span className="property-card__icon">{type.icon}</span>
              <span className="property-card__label">{type.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container">
        <h2 className="section-title">How ROOST Works</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-8)',
          paddingBottom: 'var(--space-16)',
        }}>
          {[
            { step: '1', icon: '🔍', title: 'Search', description: 'Find the perfect space in your desired location across Ethiopia.' },
            { step: '2', icon: '📅', title: 'Book', description: 'Choose your dates and book securely with TeleBirr or bank transfer.' },
            { step: '3', icon: '🏠', title: 'Stay', description: 'Check in and enjoy your stay. Feel at home anywhere in Ethiopia.' },
          ].map((item) => (
            <div key={item.step} style={{
              textAlign: 'center',
              padding: 'var(--space-8) var(--space-4)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>{item.icon}</div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--line-height-relaxed)' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA for Hosts */}
      <section style={{
        backgroundColor: 'var(--color-secondary)',
        color: 'var(--color-white)',
        textAlign: 'center',
        padding: 'var(--space-16) var(--space-4)',
        marginTop: 'var(--space-8)',
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: 'var(--space-4)',
        }}>
          Earn Money by Sharing Your Space
        </h2>
        <p style={{
          fontSize: 'var(--font-size-lg)',
          opacity: 0.85,
          marginBottom: 'var(--space-8)',
          maxWidth: '600px',
          margin: '0 auto var(--space-8)',
        }}>
          List your property on ROOST and start earning. We handle the bookings
          while you provide the hospitality.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/become-host')}
        >
          Become a Host
        </Button>
      </section>
    </div>
  );
};

export default Home;