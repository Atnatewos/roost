// apps/web/src/services/auth.js

/**
 * @file services/auth.js
 * @description Frontend authentication service using HttpOnly cookies.
 * Exports both standard names and legacy aliases for backward compatibility.
 */

import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.get('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/status');
    const data = response.data;
    
    if (data.data && data.data.loggedIn && data.data.user) {
      return data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const updateProfile = async (updates) => {
  const response = await api.patch('/auth/profile', updates);
  return response.data;
};

/**
 * Upgrade the currently authenticated user to a HOST role.
 * @returns {Promise<Object>} Updated user data
 */
export const upgradeToHost = async () => {
  const response = await api.patch('/auth/become-host');
  return response.data;
};

// Legacy aliases
export const registerUser = register;
export const loginUser = login;
export const logoutUser = logout;
export const fetchCurrentUser = getCurrentUser;