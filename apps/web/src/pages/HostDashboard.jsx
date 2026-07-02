// apps/web/src/pages/HostDashboard.jsx

/**
 * @file pages/HostDashboard.jsx
 * @description Dashboard for hosts to manage their listings.
 * Displays stats and a list of their properties with status indicators.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchHostListings, deleteListing } from '../services/listings';
import { formatDate } from '../utils/format';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const STATUS_MAP = {
  DRAFT: { label: 'Draft', variant: 'default' },
  PENDING: { label: 'Pending Approval', variant: 'warning' },
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'default' },
  SUSPENDED: { label: 'Suspended', variant: 'error' },
};

const HostDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchHostListings();
      if (response.success) {
        setListings(response.data.listings || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      return;
    }
    try {
      await deleteListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete listing.');
    }
  };

  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === 'ACTIVE').length;
  const pendingListings = listings.filter(l => l.status === 'PENDING').length;

  const cardStyle = {
    backgroundColor: 'var(--color-white, #ffffff)',
    padding: 'var(--space-6, 1.5rem)',
    borderRadius: 'var(--radius-lg, 0.5rem)',
    boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
    textAlign: 'center',
  };

  const statNumberStyle = {
    fontSize: 'var(--font-size-3xl, 1.875rem)',
    fontWeight: 'var(--font-weight-bold, 700)',
    color: 'var(--color-primary, #2563eb)',
    marginBottom: 'var(--space-1, 0.25rem)',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8, 2rem) var(--space-4, 1rem)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8, 2rem)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl, 1.875rem)', fontWeight: 'var(--font-weight-bold, 700)' }}>
          Host Dashboard
        </h1>
        <Button variant="primary" onClick={() => navigate('/create-listing')}>
          + Create New Listing
        </Button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6, 1.5rem)', marginBottom: 'var(--space-8, 2rem)' }}>
        <div style={cardStyle}>
          <div style={statNumberStyle}>{totalListings}</div>
          <div style={{ color: 'var(--color-gray-600, #4b5563)' }}>Total Listings</div>
        </div>
        <div style={cardStyle}>
          <div style={{ ...statNumberStyle, color: 'var(--color-success, #10b981)' }}>{activeListings}</div>
          <div style={{ color: 'var(--color-gray-600, #4b5563)' }}>Active Listings</div>
        </div>
        <div style={cardStyle}>
          <div style={{ ...statNumberStyle, color: 'var(--color-warning, #f59e0b)' }}>{pendingListings}</div>
          <div style={{ color: 'var(--color-gray-600, #4b5563)' }}>Pending Approval</div>
        </div>
      </div>

      {/* Listings Table */}
      <div style={{ backgroundColor: 'var(--color-white, #ffffff)', borderRadius: 'var(--radius-lg, 0.5rem)', boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)', borderBottom: '1px solid var(--color-gray-200, #e5e7eb)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)' }}>Your Properties</h2>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-6, 1.5rem)' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="card" />)}
          </div>
        ) : error ? (
          <EmptyState icon="⚠️" title="Error" description={error} action={{ label: 'Try Again', onClick: loadListings }} />
        ) : listings.length === 0 ? (
          <EmptyState icon="🏠" title="No listings yet" description="Create your first listing to start hosting." action={{ label: 'Create Listing', onClick: () => navigate('/create-listing') }} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-gray-50, #f9fafb)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--space-3, 0.75rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-xs, 0.75rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-500, #6b7280)', textTransform: 'uppercase' }}>Property</th>
                  <th style={{ padding: 'var(--space-3, 0.75rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-xs, 0.75rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-500, #6b7280)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: 'var(--space-3, 0.75rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-xs, 0.75rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-500, #6b7280)', textTransform: 'uppercase' }}>Created</th>
                  <th style={{ padding: 'var(--space-3, 0.75rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-xs, 0.75rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-500, #6b7280)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const statusInfo = STATUS_MAP[listing.status] || { label: listing.status, variant: 'default' };
                  const primaryImage = listing.images?.[0]?.url || '';
                  
                  return (
                    <tr key={listing.id} style={{ borderBottom: '1px solid var(--color-gray-200, #e5e7eb)' }}>
                      <td style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3, 0.75rem)' }}>
                          {primaryImage && (
                            <img src={primaryImage} alt={listing.title} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md, 0.375rem)', objectFit: 'cover' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 'var(--font-weight-medium, 500)' }}>{listing.title}</div>
                            <div style={{ fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-gray-500, #6b7280)' }}>{listing.city}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)' }}>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-gray-600, #4b5563)' }}>
                        {formatDate(listing.createdAt)}
                      </td>
                      <td style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2, 0.5rem)' }}>
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/listings/${listing.slug}`)}>View</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(listing.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;