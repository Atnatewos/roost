// apps/web/src/components/ui/StarRating.jsx

/**
 * @file components/ui/StarRating.jsx
 * @description Displays a star rating with optional review count.
 * Uses inline styles with project CSS variables for consistent theming.
 */

import React from 'react';

const StarRating = ({ rating = 0, count = 0, size = 18, showCount = true }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starStyle = {
    color: 'var(--color-warning, #f59e0b)',
    fontSize: `${size}px`,
    lineHeight: 1,
  };

  const emptyStarStyle = {
    color: 'var(--color-gray-300, #d1d5db)',
    fontSize: `${size}px`,
    lineHeight: 1,
  };

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`} style={starStyle}>★</span>);
  }
  if (hasHalfStar) {
    stars.push(<span key="half" style={starStyle}>★</span>);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} style={emptyStarStyle}>★</span>);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2, 0.5rem)' }}>
      <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>
      {showCount && count > 0 && (
        <span style={{ fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-gray-600, #4b5563)' }}>
          {rating.toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;