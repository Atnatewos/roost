// apps/web/src/services/listings.js

/**
 * @file services/listings.js
 * @description Listings service. Handles all listing-related API calls.
 */

import api from './api';

/**
 * Fetch listings with optional filters and pagination.
 */
export const fetchListings = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  ).toString();
  return api.get(`/listings${queryString ? `?${queryString}` : ''}`);
};

/**
 * Fetch all listings for the authenticated host.
 */
export const fetchHostListings = async () => {
  return api.get('/listings/host/my-listings');
};

/**
 * Fetch a single listing by its slug.
 */
export const fetchListing = async (slug) => {
  return api.get(`/listings/${slug}`);
};

/**
 * Create a new listing.
 */
export const createListing = async (listingData) => {
  return api.post('/listings', listingData);
};

/**
 * Update an existing listing.
 */
export const updateListing = async (id, updates) => {
  return api.patch(`/listings/${id}`, updates);
};

/**
 * Delete a listing.
 */
export const deleteListing = async (id) => {
  return api.delete(`/listings/${id}`);
};

/**
 * Upload images for a listing.
 */
export const uploadListingImages = async (listingId, formData) => {
  return api.post(`/listings/${listingId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
