// apps/web/src/services/api.js

/**
 * @file services/api.js
 * @description Axios instance with cookie support for HttpOnly authentication.
 * Includes smart redirect logic to prevent infinite loops and console spam.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Allows cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

let redirectCount = 0;
const MAX_REDIRECTS = 2;

api.interceptors.response.use(
  (response) => {
    redirectCount = 0;
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // CRITICAL FIX: Ignore 401s from the initial auth check (/auth/me).
      // This prevents console spam and unnecessary redirects for unauthenticated users.
      if (error.config.url.includes('/auth/me')) {
        return Promise.reject(error);
      }

      const currentPath = window.location.pathname;
      const isAlreadyOnAuthPage = currentPath === '/login' || currentPath === '/register';
      
      if (!isAlreadyOnAuthPage && redirectCount < MAX_REDIRECTS) {
        redirectCount++;
        window.location.href = '/login';
      } else if (redirectCount >= MAX_REDIRECTS) {
        redirectCount = 0;
      }
    }
    return Promise.reject(error);
  }
);

export default api;