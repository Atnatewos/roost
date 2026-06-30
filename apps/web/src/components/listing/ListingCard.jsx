// apps/web/src/components/listing/ListingCard.jsx

import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import cn from '../../utils/cn';

/**
 * Individual listing card displayed in search results and grids.
 * Shows primary image, title, location, price, and rating.
 * Links to the full listing detail page.
 *
 * @param {Object} props
 * @param {Object} props.listing - Listing data from the API
 * @param {string} props.variant - 'grid' | 'list'
 */
const ListingCard = ({ listing, variant = 'grid' }) => {
  // Extract primary image or use placeholder
  const primaryImage = listing.images?.[0]?.url || '/images/placeholder.jpg';

  return (
    <Link
      to={`/listing/${listing.slug}`}
      className={cn('listing-card', `listing-card--${variant}`)}
    >
      {/* Image container */}
      <div className="listing-card__image">
        <img
          src={primaryImage}
          alt={listing.title}
          loading="lazy"
        />
        {/* Price badge overlay */}
        <span className="listing-card__price-badge">
          {formatPrice(listing.basePrice)}<span className="listing-card__price-night">/night</span>
        </span>
      </div>

      {/* Content section */}
      <div className="listing-card__content">
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__location">
          {listing.city}{listing.subcity ? `, ${listing.subcity}` : ''}
        </p>

        {/* Footer with details */}
        <div className="listing-card__footer">
          <div className="listing-card__details">
            <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'}</span>
            <span className="listing-card__dot">·</span>
            <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
            <span className="listing-card__dot">·</span>
            <span>{listing.maxGuests} {listing.maxGuests === 1 ? 'guest' : 'guests'}</span>
          </div>

          {/* Rating (only show if there are reviews) */}
          {listing.averageRating > 0 && (
            <div className="listing-card__rating">
              <span className="listing-card__star">★</span>
              <span>{listing.averageRating.toFixed(1)}</span>
              <span className="listing-card__review-count">
                ({listing.reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;