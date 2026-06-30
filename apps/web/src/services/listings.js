// apps/web/src/services/listings.js

import api from './api';

/**
 * Listings service.
 * Handles all listing-related API calls.
 */

/**
 * Fetch listings with optional filters and pagination.
 *
 * @param {Object} params - Query parameters (page, limit, city, propertyType, etc.)
 * @returns {Promise<Object>} Paginated listings response
 */
export const fetchListings = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  ).toString();

  return api.get(`/listings${queryString ? `?${queryString}` : ''}`);
};

/**
 * Fetch a single listing by its slug.
 *
 * @param {string} slug - Listing URL slug
 * @returns {Promise<Object>} Listing details with host info and images
 */
export const fetchListing = async (slug) => {
  return api.get(`/listings/${slug}`);
};

/**
 * Create a new listing.
 *
 * @param {Object} listingData - Listing creation payload
 * @returns {Promise<Object>} Created listing data
 */
export const createListing = async (listingData) => {
  return api.post('/listings', listingData);
};

/**
 * Update an existing listing.
 *
 * @param {string} id - Listing ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated listing data
 */
export const updateListing = async (id, updates) => {
  return api.patch(`/listings/${id}`, updates);
};

/**
 * Delete a listing.
 *
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteListing = async (id) => {
  return api.delete(`/listings/${id}`);
};

/**
 * Upload images for a listing.
 *
 * @param {string} listingId - Listing ID
 * @param {FormData} formData - Form data containing image files
 * @returns {Promise<Object>} Uploaded images data
 */
export const uploadListingImages = async (listingId, formData) => {
  return api.post(`/listings/${listingId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};