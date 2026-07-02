// apps/web/src/components/listing/ListingCard.jsx

/**
 * @file components/listing/ListingCard.jsx
 * @description Card component for displaying listing summaries in grids.
 * Used in Search results and potentially Home page featured sections.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

const ListingCard = ({ listing }) => {
  if (!listing) return null;

  const primaryImage = listing.images?.[0]?.url || '/images/placeholder.jpg';
  const rating = listing.averageRating || 4.5; // Fallback for demo
  const reviewCount = listing.reviewCount || 0;

  const cardStyle = {
    backgroundColor: 'var(--color-white, #ffffff)',
    borderRadius: 'var(--radius-lg, 0.5rem)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
    transition: 'transform var(--transition-fast, 0.2s), box-shadow var(--transition-fast, 0.2s)',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: 'var(--color-gray-100, #f3f4f6)',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const contentStyle = {
    padding: 'var(--space-4, 1rem)',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  };

  const titleStyle = {
    fontSize: 'var(--font-size-lg, 1.125rem)',
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-gray-900, #111827)',
    marginBottom: 'var(--space-1, 0.25rem)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const locationStyle = {
    fontSize: 'var(--font-size-sm, 0.875rem)',
    color: 'var(--color-gray-600, #4b5563)',
    marginBottom: 'var(--space-2, 0.5rem)',
  };

  const detailsStyle = {
    fontSize: 'var(--font-size-sm, 0.875rem)',
    color: 'var(--color-gray-500, #6b7280)',
    marginBottom: 'var(--space-3, 0.75rem)',
  };

  const priceContainerStyle = {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--space-1, 0.25rem)',
  };

  const priceStyle = {
    fontSize: 'var(--font-size-lg, 1.125rem)',
    fontWeight: 'var(--font-weight-bold, 700)',
    color: 'var(--color-gray-900, #111827)',
  };

  const perNightStyle = {
    fontSize: 'var(--font-size-sm, 0.875rem)',
    color: 'var(--color-gray-600, #4b5563)',
  };

  return (
    <Link 
      to={`/listings/${listing.slug}`} 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))';
      }}
    >
      <div style={imageContainerStyle}>
        <img src={primaryImage} alt={listing.title} style={imageStyle} loading="lazy" />
      </div>
      
      <div style={contentStyle}>
        <h3 style={titleStyle}>{listing.title}</h3>
        <p style={locationStyle}>{listing.city}, {listing.subcity || 'Ethiopia'}</p>
        <p style={detailsStyle}>
          {listing.bedrooms} bed · {listing.bathrooms} bath · {listing.maxGuests} guests
        </p>
        
        <div style={priceContainerStyle}>
          <span style={priceStyle}>{formatPrice(listing.basePrice)}</span>
          <span style={perNightStyle}>night</span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;