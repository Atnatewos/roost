// apps/web/src/services/api.js

import axios from 'axios';
import { appConfig } from '@roost/config';

/**
 * Axios HTTP Client Configuration
 * 
 * Base URL is automatically detected from the current environment
 * via the shared config package. No hardcoded URLs anywhere.
 * 
 * - Production: https://rooststay.vercel.app/api (auto-detected)
 * - Development: http://localhost:5000/api (via Vite proxy)
 * 
 * Security:
 * - JWT token is attached to every request from sessionStorage
 * - 401 responses trigger automatic session cleanup
 * - Network errors are caught and surfaced to the user
 */

const api = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * Attaches the JWT authentication token to every outgoing request.
 * The token is read from sessionStorage, which is scoped to the
 * current browser tab. This means different tabs can have different
 * authenticated users without conflict.
 */
api.interceptors.request.use(
  (config) => {
    let token = null;
    
    try {
      token = sessionStorage.getItem('roost_token');
    } catch {
      // sessionStorage unavailable - request proceeds without auth
    }

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
 * Response Interceptor
 * 
 * Handles common API response scenarios:
 * - Successful responses pass through to the calling code
 * - 401 Unauthorized clears the session and redirects to login
 * - Network errors surface a user-friendly message
 * 
 * Session cleanup on 401 is scoped to the current tab only.
 * Other tabs with different sessions are unaffected.
 */
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Network error - server unreachable
    if (!error.response) {
      console.error('Network error: Unable to reach the server.');
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
      });
    }

    // Authentication error - token expired or invalid
    if (error.response.status === 401) {
      try {
        sessionStorage.removeItem('roost_token');
        sessionStorage.removeItem('roost_user');
      } catch {
        // Cleanup failed - redirect anyway
      }

      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Pass the error through for component-level handling
    return Promise.reject(error.response.data);
  }
);

export default api;