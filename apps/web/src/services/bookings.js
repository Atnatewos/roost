// apps/web/src/services/bookings.js

import api from './api';

/**
 * Bookings service.
 * Handles all booking-related API calls.
 */

/**
 * Create a new booking request.
 *
 * @param {Object} bookingData - { listingId, checkIn, checkOut, guestCount, specialRequests, paymentMethod }
 * @returns {Promise<Object>} Created booking data
 */
export const createBooking = async (bookingData) => {
  return api.post('/bookings', bookingData);
};

/**
 * Fetch bookings for the authenticated user.
 *
 * @param {Object} params - Query parameters (page, limit, status)
 * @returns {Promise<Object>} Paginated bookings response
 */
export const fetchMyBookings = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  ).toString();

  return api.get(`/bookings${queryString ? `?${queryString}` : ''}`);
};

/**
 * Fetch a single booking by ID.
 *
 * @param {string} id - Booking ID
 * @returns {Promise<Object>} Booking details with listing and guest info
 */
export const fetchBooking = async (id) => {
  return api.get(`/bookings/${id}`);
};

/**
 * Cancel an existing booking.
 *
 * @param {string} id - Booking ID
 * @returns {Promise<Object>} Cancelled booking data
 */
export const cancelBooking = async (id) => {
  return api.patch(`/bookings/${id}/cancel`);
};