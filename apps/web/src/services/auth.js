// apps/web/src/services/auth.js

import api from './api';

/**
 * Authentication Service
 * 
 * Uses sessionStorage for token and user data storage.
 * This is the enterprise-standard approach because:
 * 
 * 1. Tab Isolation: Each browser tab maintains its own session.
 *    A host can be logged in on Tab 1 while a guest is logged in on Tab 2.
 * 
 * 2. Security: Tokens are automatically cleared when the tab is closed.
 *    This prevents lingering credentials that XSS attacks could exploit.
 * 
 * 3. Compliance: Aligns with OWASP security guidelines and OAuth2 best practices.
 *    localStorage is explicitly discouraged for auth tokens by security standards.
 * 
 * Note: Opening a new tab requires re-authentication.
 * This is intentional and matches how Google, Microsoft 365, and AWS behave.
 */

const TOKEN_KEY = 'roost_token';
const USER_KEY = 'roost_user';

/**
 * Persist authentication data to sessionStorage.
 * Session storage is scoped to the current tab only.
 * 
 * @param {string} token - JWT authentication token
 * @param {Object} user - User profile object
 */
const persistAuth = (token, user) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    // sessionStorage unavailable (e.g., private browsing in some browsers)
    console.error('Failed to persist authentication data:', error.message);
  }
};

/**
 * Clear all authentication data from sessionStorage.
 * Called on logout or when the token is found to be invalid.
 */
const clearAuth = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to clear authentication data:', error.message);
  }
};

/**
 * Retrieve the stored JWT token from sessionStorage.
 * 
 * @returns {string|null} The token if found, null otherwise
 */
const getStoredToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

/**
 * Retrieve the stored user object from sessionStorage.
 * Returns null if parsing fails (corrupted data) or no user exists.
 * 
 * @returns {Object|null} Parsed user object or null
 */
const getStoredUser = () => {
  try {
    const userJson = sessionStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    return user;
  } catch {
    // Corrupted session data - clear it
    clearAuth();
    return null;
  }
};

/**
 * Register a new user account.
 * On success, persists the token and user data to sessionStorage.
 * 
 * @param {Object} userData - { email, phone, password, fullName }
 * @returns {Promise<Object>} API response with user data and token
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);

  if (response.success && response.data.token) {
    persistAuth(response.data.token, response.data.user);
  }

  return response;
};

/**
 * Login an existing user.
 * On success, persists the token and user data to sessionStorage.
 * 
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} API response with user data and token
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);

  if (response.success && response.data.token) {
    persistAuth(response.data.token, response.data.user);
  }

  return response;
};

/**
 * Logout the current user from this tab.
 * Clears sessionStorage and redirects to the home page.
 * Does NOT affect other tabs - each tab has its own session.
 */
export const logoutUser = () => {
  clearAuth();
  window.location.href = '/';
};

/**
 * Get the currently authenticated user's profile from the server.
 * Used to verify the token is still valid after a page refresh.
 * 
 * @returns {Promise<Object>} API response with fresh user data
 */
export const getCurrentUser = async () => {
  return api.get('/auth/me');
};

/**
 * Update the authenticated user's profile.
 * Updates the stored user data on success.
 * 
 * @param {Object} updates - Fields to update (fullName, phone, avatar)
 * @returns {Promise<Object>} API response with updated user data
 */
export const updateProfile = async (updates) => {
  const response = await api.patch('/auth/profile', updates);

  if (response.success && response.data.user) {
    // Update the stored user data without changing the token
    persistAuth(getStoredToken(), response.data.user);
  }

  return response;
};

/**
 * Check if a user is currently authenticated in this tab.
 * Verifies token existence in sessionStorage without making an API call.
 * The token's validity is verified by the API on each request.
 * 
 * @returns {boolean} True if a token exists in sessionStorage
 */
export const isAuthenticated = () => {
  const token = getStoredToken();
  return !!token;
};

export { getStoredToken, getStoredUser };