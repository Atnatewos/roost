// apps/web/src/pages/AdminDashboard.jsx

/**
 * @file pages/AdminDashboard.jsx
 * @description Administrative dashboard for platform management.
 * Allows admins to view all listings and approve or suspend them.
 */

import React, { useState, useEffect } from 'react';
import { fetchAllListings, updateListingStatus } from '../services/admin';
import { formatDate } from '../utils/format';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const STATUS_MAP = {
  DRAFT: { label: 'Draft', variant: 'default' },
  PENDING: { label: 'Pending', variant: 'warning' },
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'default' },
  SUSPENDED: { label: 'Suspended', variant: 'error' },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const response = await fetchAllListings(params);
      if (response.success) {
        setListings(response.data.listings || response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateListingStatus(id, newStatus);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8, 2rem) var(--space-4, 1rem)' }}>
      <h1 style={{ fontSize: 'var(--font-size-3xl, 1.875rem)', fontWeight: 'var(--font-weight-bold, 700)', marginBottom: 'var(--space-8, 2rem)' }}>
        Admin Dashboard
      </h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2, 0.5rem)', marginBottom: 'var(--space-6, 1.5rem)', borderBottom: '1px solid var(--color-gray-200, #e5e7eb)', paddingBottom: 'var(--space-2, 0.5rem)' }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            style={{
              padding: 'var(--space-2, 0.5rem) var(--space-4, 1rem)',
              backgroundColor: statusFilter === tab.value ? 'var(--color-primary, #2563eb)' : 'transparent',
              color: statusFilter === tab.value ? 'var(--color-white, #ffffff)' : 'var(--color-gray-700, #374151)',
              border: 'none',
              borderRadius: 'var(--radius-md, 0.375rem)',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium, 500)',
              transition: 'all var(--transition-fast, 0.2s)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Table */}
      <div style={{ backgroundColor: 'var(--color-white, #ffffff)', borderRadius: 'var(--radius-lg, 0.5rem)', boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-6, 1.5rem)' }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="card" />)}
          </div>
        ) : error ? (
          <EmptyState icon="⚠️" title="Error" description={error} action={{ label: 'Try Again', onClick: loadListings }} />
        ) : listings.length === 0 ? (
          <EmptyState icon="📋" title="No listings found" description="No listings match the current filter." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-gray-50, #f9fafb)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--space-3, 0.75rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-xs, 0.75rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-500, #6b7280)', textTransform: 'uppercase' }}>Property</th>
                  <th style={{ padding: 'var(--space-3, 0.75rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-xs, 0.75rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-500, #6b7280)', textTransform: 'uppercase' }}>Host</th>
                  <th style={{ padding: 'var(--space-3, 0.75rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-xs, 0.75rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-500, #6b7280)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: 'var(--space-3, 0.75rem) var(--space-6, 1.5rem)', fontSize: 'var(--font-size-xs, 0.75rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-500, #6b7280)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const statusInfo = STATUS_MAP[listing.status] || { label: listing.status, variant: 'default' };
                  
                  return (
                    <tr key={listing.id} style={{ borderBottom: '1px solid var(--color-gray-200, #e5e7eb)' }}>
                      <td style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)' }}>
                        <div style={{ fontWeight: 'var(--font-weight-medium, 500)' }}>{listing.title}</div>
                        <div style={{ fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-gray-500, #6b7280)' }}>{listing.city}</div>
                      </td>
                      <td style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)' }}>
                        <div style={{ fontSize: 'var(--font-size-sm, 0.875rem)' }}>{listing.host?.fullName || 'Unknown'}</div>
                        <div style={{ fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--color-gray-500, #6b7280)' }}>{listing.host?.email}</div>
                      </td>
                      <td style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)' }}>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td style={{ padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2, 0.5rem)' }}>
                          {listing.status === 'PENDING' && (
                            <Button variant="success" size="sm" onClick={() => handleStatusChange(listing.id, 'ACTIVE')}>Approve</Button>
                          )}
                          {listing.status === 'ACTIVE' && (
                            <Button variant="danger" size="sm" onClick={() => handleStatusChange(listing.id, 'SUSPENDED')}>Suspend</Button>
                          )}
                          {listing.status === 'SUSPENDED' && (
                            <Button variant="success" size="sm" onClick={() => handleStatusChange(listing.id, 'ACTIVE')}>Reactivate</Button>
                          )}
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

export default AdminDashboard;