// apps/web/src/pages/MyBookings.jsx

/**
 * @file pages/MyBookings.jsx
 * @description Displays all bookings for the authenticated user.
 * Fixed: Replaced window.location.href with useNavigate for SPA routing.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMyBookings } from '../services/bookings';
import { formatDate, formatPrice } from '../utils/format';
import { listingConfig } from '@roost/config';
import useAuth from '../hooks/useAuth';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

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
  const navigate = useNavigate(); // Added for SPA navigation
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        My Bookings
      </h1>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col gap-4">
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
          icon=""
          title="No bookings yet"
          description="When you book a space, it will appear here. Start exploring our listings!"
          action={{ 
            label: 'Browse Spaces', 
            onClick: () => navigate('/search') // Fixed: SPA navigation instead of full reload
          }}
        />
      )}

      {/* Bookings list */}
      {!loading && !error && bookings.length > 0 && (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => {
            const statusInfo = STATUS_MAP[booking.status] || { label: booking.status, variant: 'default' };
            const primaryImage = booking.listing?.images?.[0]?.url || '/images/placeholder.jpg';

            return (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <img
                  src={primaryImage}
                  alt={booking.listing?.title}
                  className="w-32 h-24 object-cover rounded-md flex-shrink-0"
                />

                {/* Booking details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {booking.listing?.title || 'Listing'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                    {' · '}{booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                  </p>
                  <div className="flex gap-3 items-center">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span className="text-sm font-semibold text-blue-600">
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