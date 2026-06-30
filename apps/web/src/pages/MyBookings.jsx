// apps/web/src/pages/MyBookings.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings } from '../services/bookings';
import { formatDate, formatPrice } from '../utils/format';
import { listingConfig } from '@roost/config';
import useAuth from '../hooks/useAuth';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

/**
 * My Bookings Page.
 * Displays all bookings for the authenticated user.
 * Guests see their bookings, hosts see bookings for their listings.
 * Shows booking status with custom badges - never uses browser defaults.
 */

// Status badge mapping using our custom Badge component
const STATUS_MAP = {
  PENDING_PAYMENT: { label: 'Awaiting Payment', variant: 'warning' },
  PAYMENT_UPLOADED: { label: 'Payment Under Review', variant: 'info' },
  PAYMENT_CONFIRMED: { label: 'Confirmed', variant: 'success' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'error' },
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch bookings from the API.
   * Handles loading, error, and empty states gracefully.
   */
  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchMyBookings({ limit: 50 });

      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
      <h1 style={{
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)',
        marginBottom: 'var(--space-8)',
      }}>
        My Bookings
      </h1>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <EmptyState
          icon="⚠️"
          title="Error Loading Bookings"
          description={error}
          action={{ label: 'Try Again', onClick: loadBookings }}
        />
      )}

      {/* Empty state */}
      {!loading && !error && bookings.length === 0 && (
        <EmptyState
          icon="📋"
          title="No bookings yet"
          description="When you book a space, it will appear here. Start exploring our listings!"
          action={{ label: 'Browse Spaces', onClick: () => window.location.href = '/search' }}
        />
      )}

      {/* Bookings list */}
      {!loading && !error && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {bookings.map((booking) => {
            const statusInfo = STATUS_MAP[booking.status] || { label: booking.status, variant: 'default' };
            const primaryImage = booking.listing?.images?.[0]?.url || '/images/placeholder.jpg';

            return (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'box-shadow var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Thumbnail */}
                <img
                  src={primaryImage}
                  alt={booking.listing?.title}
                  style={{
                    width: '120px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    flexShrink: 0,
                  }}
                />

                {/* Booking details */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    {booking.listing?.title || 'Listing'}
                  </h3>
                  <p style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-gray-600)',
                    marginBottom: 'var(--space-2)',
                  }}>
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                    {' · '}{booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-primary)',
                    }}>
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;