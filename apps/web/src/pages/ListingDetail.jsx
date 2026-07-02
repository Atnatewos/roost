// apps/web/src/pages/ListingDetail.jsx

/**
 * @file pages/ListingDetail.jsx
 * @description Detailed view of a single listing.
 * Displays image gallery, property details, host info, and booking widget.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchListing } from '../services/listings';
import { formatPrice } from '../utils/format';
import useAuth from '../hooks/useAuth';
import ImageGallery from '../components/ui/ImageGallery';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';

const ListingDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const loadListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchListing(slug);
        if (response.success && response.data.listing) {
          setListing(response.data.listing);
        } else {
          setError('Listing not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load listing details.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadListing();
    }
  }, [slug]);

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !listing) return null;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return null;
    
    const baseTotal = listing.basePrice * nights;
    const cleaningFee = listing.cleaningFee || 0;
    const total = baseTotal + cleaningFee;
    
    return { nights, baseTotal, cleaningFee, total };
  };

  const totals = calculateTotal();

  const handleBook = () => {
    if (!user) {
      navigate('/login', { state: { from: `/listings/${slug}` } });
      return;
    }
    alert('Booking flow to be implemented next!');
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8, 2rem)', textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ padding: 'var(--space-8, 2rem)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl, 1.5rem)', marginBottom: 'var(--space-4, 1rem)' }}>
          {error || 'Listing not found'}
        </h2>
        <Button onClick={() => navigate('/search')}>Back to Search</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8, 2rem) var(--space-4, 1rem)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6, 1.5rem)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl, 1.875rem)', fontWeight: 'var(--font-weight-bold, 700)', marginBottom: 'var(--space-2, 0.5rem)' }}>
          {listing.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4, 1rem)', flexWrap: 'wrap' }}>
          <StarRating rating={listing.averageRating} count={listing.reviewCount} />
          <span style={{ color: 'var(--color-gray-600, #4b5563)' }}>
            {listing.address}, {listing.city}
            {listing.subcity ? `, ${listing.subcity}` : ''}
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      <div style={{ marginBottom: 'var(--space-8, 2rem)' }}>
        <ImageGallery images={listing.images} />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8, 2rem)' }}>
        {/* Left Column */}
        <div>
          {/* Property Info */}
          <div style={{ marginBottom: 'var(--space-8, 2rem)', paddingBottom: 'var(--space-8, 2rem)', borderBottom: '1px solid var(--color-gray-200, #e5e7eb)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', marginBottom: 'var(--space-4, 1rem)' }}>
              {listing.placeType === 'ENTIRE_PLACE' ? 'Entire place' : listing.placeType === 'PRIVATE_ROOM' ? 'Private room' : 'Shared room'} hosted by {listing.host.fullName}
            </h2>
            <p style={{ color: 'var(--color-gray-600, #4b5563)', marginBottom: 'var(--space-4, 1rem)' }}>
              {listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''} · {listing.bathrooms} bathroom{listing.bathrooms > 1 ? 's' : ''} · {listing.maxGuests} guest{listing.maxGuests > 1 ? 's' : ''}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4, 1rem)', paddingTop: 'var(--space-4, 1rem)', borderTop: '1px solid var(--color-gray-200, #e5e7eb)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-gray-200, #e5e7eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-xl, 1.25rem)' }}>
                {listing.host.avatar ? <img src={listing.host.avatar} alt={listing.host.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : ''}
              </div>
              <div>
                <p style={{ fontWeight: 'var(--font-weight-medium, 500)' }}>{listing.host.fullName}</p>
                <p style={{ fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-gray-600, #4b5563)' }}>Host</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 'var(--space-8, 2rem)', paddingBottom: 'var(--space-8, 2rem)', borderBottom: '1px solid var(--color-gray-200, #e5e7eb)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', marginBottom: 'var(--space-4, 1rem)' }}>About this space</h2>
            <p style={{ lineHeight: 'var(--line-height-relaxed, 1.6)', color: 'var(--color-gray-700, #374151)' }}>
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div style={{ marginBottom: 'var(--space-8, 2rem)', paddingBottom: 'var(--space-8, 2rem)', borderBottom: '1px solid var(--color-gray-200, #e5e7eb)' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', marginBottom: 'var(--space-4, 1rem)' }}>What this place offers</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3, 0.75rem)' }}>
                {listing.amenities.map((amenity, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2, 0.5rem)' }}>
                    <span>✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Booking Widget */}
        <div>
          <div style={{
            position: 'sticky',
            top: 'var(--space-4, 1rem)',
            border: '1px solid var(--color-gray-200, #e5e7eb)',
            borderRadius: 'var(--radius-lg, 0.5rem)',
            padding: 'var(--space-6, 1.5rem)',
            boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
            backgroundColor: 'var(--color-white, #ffffff)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2, 0.5rem)', marginBottom: 'var(--space-6, 1.5rem)' }}>
              <span style={{ fontSize: 'var(--font-size-2xl, 1.5rem)', fontWeight: 'var(--font-weight-semibold, 600)' }}>
                {formatPrice(listing.basePrice)}
              </span>
              <span style={{ color: 'var(--color-gray-600, #4b5563)' }}>night</span>
            </div>

            <div style={{ border: '1px solid var(--color-gray-300, #d1d5db)', borderRadius: 'var(--radius-md, 0.375rem)', overflow: 'hidden', marginBottom: 'var(--space-4, 1rem)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--color-gray-300, #d1d5db)' }}>
                <div style={{ padding: 'var(--space-3, 0.75rem)', borderBottom: '1px solid var(--color-gray-300, #d1d5db)' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'var(--font-weight-bold, 700)', marginBottom: 'var(--space-1, 0.25rem)' }}>CHECK-IN</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 'var(--font-size-sm, 0.875rem)' }}
                  />
                </div>
                <div style={{ padding: 'var(--space-3, 0.75rem)' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'var(--font-weight-bold, 700)', marginBottom: 'var(--space-1, 0.25rem)' }}>CHECKOUT</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 'var(--font-size-sm, 0.875rem)' }}
                  />
                </div>
              </div>
              <div style={{ padding: 'var(--space-3, 0.75rem)' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'var(--font-weight-bold, 700)', marginBottom: 'var(--space-1, 0.25rem)' }}>GUESTS</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 'var(--font-size-sm, 0.875rem)', backgroundColor: 'transparent' }}
                >
                  {Array.from({ length: listing.maxGuests }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleBook}
              disabled={!checkIn || !checkOut || !totals}
            >
              {user ? 'Reserve' : 'Sign in to book'}
            </Button>

            {totals && (
              <div style={{ marginTop: 'var(--space-6, 1.5rem)', paddingTop: 'var(--space-6, 1.5rem)', borderTop: '1px solid var(--color-gray-200, #e5e7eb)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3, 0.75rem)' }}>
                  <span style={{ textDecoration: 'underline' }}>{formatPrice(listing.basePrice)} x {totals.nights} night{totals.nights > 1 ? 's' : ''}</span>
                  <span>{formatPrice(totals.baseTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3, 0.75rem)' }}>
                  <span style={{ textDecoration: 'underline' }}>Cleaning fee</span>
                  <span>{formatPrice(totals.cleaningFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-3, 0.75rem)', borderTop: '1px solid var(--color-gray-200, #e5e7eb)', fontWeight: 'var(--font-weight-bold, 700)' }}>
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;