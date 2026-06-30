// apps/web/src/pages/Search.jsx

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchListings } from '../services/listings';
import { listingConfig } from '@roost/config';
import ListingCard from '../components/listing/ListingCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

/**
 * ROOST Search Results Page.
 * Displays filtered listings with real-time search.
 * Reads initial filters from URL query parameters.
 * Shows skeleton loading while fetching, empty state when no results.
 */
const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);

  // Read initial values from URL params
  const initialSearch = searchParams.get('search') || '';
  const initialCity = searchParams.get('city') || '';
  const initialType = searchParams.get('propertyType') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedType, setSelectedType] = useState(initialType);

  /**
   * Fetch listings from the API based on current filters.
   * Updates URL search params to reflect current filter state.
   */
  const loadListings = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters from current filter state
      const params = {
        page: currentPage,
        limit: listingConfig.searchFilters?.perPage || 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCity && { city: selectedCity }),
        ...(selectedType && { propertyType: selectedType }),
      };

      // Update URL without full page reload
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          urlParams.set(key, value);
        }
      });
      setSearchParams(urlParams, { replace: true });

      const response = await fetchListings(params);

      if (response.success) {
        setListings(response.data);
        setTotalResults(response.meta?.total || 0);
        setPage(currentPage);
      }
    } catch (err) {
      setError(err.message || 'Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load listings when component mounts or filters change
  useEffect(() => {
    loadListings(1);
  }, []); // Initial load only - user triggers subsequent searches

  /**
   * Handle search form submission.
   * Resets to page 1 and applies all active filters.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    loadListings(1);
  };

  return (
    <div className="search-page container">
      {/* Search header with filters */}
      <div className="search-page__header">
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}>
          <Input
            label="Search"
            placeholder="City, neighborhood, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
          <Input
            label="City"
            placeholder="Any city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: 'var(--space-3)',
              border: '2px solid var(--color-gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              minWidth: '180px',
              backgroundColor: 'var(--color-white)',
            }}
          >
            <option value="">All Property Types</option>
            {listingConfig.propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {/* Results count */}
        {!loading && (
          <p className="search-page__count" style={{ marginTop: 'var(--space-4)' }}>
            {totalResults} {totalResults === 1 ? 'space' : 'spaces'} found
          </p>
        )}
      </div>

      {/* Loading state - custom skeleton grid */}
      {loading && (
        <div className="search-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <EmptyState
          icon="⚠️"
          title="Search Error"
          description={error}
          action={{ label: 'Try Again', onClick: () => loadListings(1) }}
        />
      )}

      {/* Empty results state */}
      {!loading && !error && listings.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No spaces found"
          description="Try adjusting your search filters or exploring a different area."
          action={{ label: 'Clear Filters', onClick: () => {
            setSearchTerm('');
            setSelectedCity('');
            setSelectedType('');
            loadListings(1);
          }}}
        />
      )}

      {/* Listing results grid */}
      {!loading && !error && listings.length > 0 && (
        <>
          <div className="search-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {totalResults > listingConfig.searchFilters?.perPage && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-8)',
              marginBottom: 'var(--space-8)',
            }}>
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => loadListings(page - 1)}
              >
                Previous
              </Button>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--space-4)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-gray-600)',
              }}>
                Page {page} of {Math.ceil(totalResults / (listingConfig.searchFilters?.perPage || 12))}
              </span>
              <Button
                variant="outline"
                disabled={page >= Math.ceil(totalResults / (listingConfig.searchFilters?.perPage || 12))}
                onClick={() => loadListings(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;