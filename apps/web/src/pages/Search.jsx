// apps/web/src/pages/Search.jsx

/**
 * @file pages/Search.jsx
 * @description Search and filter page for discovering listings.
 * Connects to the backend API to fetch and display properties.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchListings } from '../services/listings';
import ListingCard from '../components/listing/ListingCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  useEffect(() => {
    loadListings(1, true);
  }, [searchParams]);

  const loadListings = async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pageNum,
        limit: 12,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await fetchListings(params);
      
      if (response.success) {
        const newListings = response.data.listings || response.data || [];
        
        if (reset) {
          setListings(newListings);
        } else {
          setListings(prev => [...prev, ...newListings]);
        }
        
        setHasMore(newListings.length === 12); // Assuming limit is 12
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    // Update URL params
    const newParams = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) newParams[key] = filters[key];
    });
    setSearchParams(newParams);
    loadListings(1, true);
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--space-2, 0.5rem) var(--space-3, 0.75rem)',
    border: '1px solid var(--color-gray-300, #d1d5db)',
    borderRadius: 'var(--radius-md, 0.375rem)',
    fontSize: 'var(--font-size-sm, 0.875rem)',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 'var(--font-size-xs, 0.75rem)',
    fontWeight: 'var(--font-weight-medium, 500)',
    color: 'var(--color-gray-700, #374151)',
    marginBottom: 'var(--space-1, 0.25rem)',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8, 2rem) var(--space-4, 1rem)' }}>
      <h1 style={{ fontSize: 'var(--font-size-3xl, 1.875rem)', fontWeight: 'var(--font-weight-bold, 700)', marginBottom: 'var(--space-6, 1.5rem)' }}>
        Find Your Perfect Space
      </h1>

      {/* Filter Bar */}
      <form onSubmit={applyFilters} style={{ 
        backgroundColor: 'var(--color-white, #ffffff)', 
        padding: 'var(--space-4, 1rem)', 
        borderRadius: 'var(--radius-lg, 0.5rem)', 
        boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
        marginBottom: 'var(--space-8, 2rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4, 1rem)',
        alignItems: 'end'
      }}>
        <div>
          <label style={labelStyle}>Destination</label>
          <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Addis Ababa, etc." style={inputStyle} />
        </div>
        
        <div>
          <label style={labelStyle}>Property Type</label>
          <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange} style={inputStyle}>
            <option value="">All Types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="VILLA">Villa</option>
            <option value="STUDIO">Studio</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Min Price</label>
          <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="0" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Max Price</label>
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="10000" style={inputStyle} />
        </div>

        <Button type="submit" variant="primary">Search</Button>
      </form>

      {/* Results Grid */}
      {loading && page === 1 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6, 1.5rem)' }}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : error ? (
        <EmptyState icon="⚠️" title="Error" description={error} action={{ label: 'Try Again', onClick: () => loadListings(1, true) }} />
      ) : listings.length === 0 ? (
        <EmptyState icon="" title="No listings found" description="Try adjusting your filters or search for a different location." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6, 1.5rem)' }}>
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-8, 2rem)' }}>
              <Button variant="secondary" onClick={() => loadListings(page + 1, false)} loading={loading}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;