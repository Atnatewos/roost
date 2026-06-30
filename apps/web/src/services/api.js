// apps/web/src/services/api.js

import axios from 'axios';
import { appConfig } from '@roost/config';

/**
 * Axios instance pre-configured with ROOST API settings.
 * Includes automatic token attachment, request/response interceptors,
 * and standardized error handling.
 */

// Create axios instance with base configuration from config
const api = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor.
 * Attaches the JWT token to every outgoing request if available.
 * The token is stored in localStorage after successful login.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('roost_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor.
 * Handles common response scenarios:
 * - 401 Unauthorized: Clears token and redirects to login
 * - Other errors: Passes through for component-level handling
 */
api.interceptors.response.use(
  (response) => {
    // Simply return the response data for successful requests
    return response.data;
  },
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('Network error: Unable to reach the server.');
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
      });
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      localStorage.removeItem('roost_token');
      localStorage.removeItem('roost_user');

      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Return the error response data for component handling
    return Promise.reject(error.response.data);
  }
);

export default api;