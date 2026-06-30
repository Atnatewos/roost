// apps/web/src/services/payments.js

import api from './api';

/**
 * Payments service.
 * Handles all payment-related API calls.
 */

/**
 * Upload payment proof for a booking.
 *
 * @param {string} bookingId - Booking ID
 * @param {Object} paymentData - { paymentProof, transactionId, paymentMethod }
 * @returns {Promise<Object>} Updated booking with payment status
 */
export const uploadPaymentProof = async (bookingId, paymentData) => {
  return api.post(`/payments/${bookingId}/proof`, paymentData);
};

/**
 * Get payment status for a booking.
 *
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Payment status data
 */
export const getPaymentStatus = async (bookingId) => {
  return api.get(`/payments/${bookingId}/status`);
};