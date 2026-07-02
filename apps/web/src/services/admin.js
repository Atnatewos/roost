// apps/web/src/services/admin.js

/**
 * @file services/admin.js
 * @description Admin service. Handles platform management API calls.
 */

import api from './api';

/**
 * Fetch all listings with optional status filtering.
 */
export const fetchAllListings = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  ).toString();
  return api.get(`/admin/listings${queryString ? `?${queryString}` : ''}`);
};

/**
 * Update the status of a listing (e.g., approve or suspend).
 */
export const updateListingStatus = async (id, status) => {
  return api.patch(`/admin/listings/${id}/status`, { status });
};