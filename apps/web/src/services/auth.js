// apps/web/src/services/auth.js

import api from './api';

/**
 * Authentication service.
 * Handles all auth-related API calls and local token management.
 */

/**
 * Register a new user account.
 *
 * @param {Object} userData - { email, phone, password, fullName }
 * @returns {Promise<Object>} Response with user data and token
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);

  // Store authentication data on successful registration
  if (response.success && response.data.token) {
    localStorage.setItem('roost_token', response.data.token);
    localStorage.setItem('roost_user', JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Login an existing user.
 *
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} Response with user data and token
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);

  // Store authentication data on successful login
  if (response.success && response.data.token) {
    localStorage.setItem('roost_token', response.data.token);
    localStorage.setItem('roost_user', JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Logout the current user.
 * Removes all stored authentication data from localStorage.
 */
export const logoutUser = () => {
  localStorage.removeItem('roost_token');
  localStorage.removeItem('roost_user');
  window.location.href = '/';
};

/**
 * Get the currently authenticated user's profile.
 *
 * @returns {Promise<Object>} Response with user data
 */
export const getCurrentUser = async () => {
  return api.get('/auth/me');
};

/**
 * Update the authenticated user's profile.
 *
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Response with updated user data
 */
export const updateProfile = async (updates) => {
  return api.patch('/auth/profile', updates);
};

/**
 * Check if a user is currently authenticated.
 * Verifies token existence without making an API call.
 *
 * @returns {boolean} True if a token exists in localStorage
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('roost_token');
  return !!token;
};

/**
 * Get the stored user data from localStorage.
 *
 * @returns {Object|null} Parsed user object or null
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('roost_user');
    return user ? JSON.parse(user) : null;
  } catch {
    localStorage.removeItem('roost_user');
    return null;
  }
};