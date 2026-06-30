// packages/config/src/app.js

/**
 * ROOST Application Configuration
 * 
 * All URLs are dynamically detected at runtime based on the current environment.
 * No hardcoded production URLs anywhere in the codebase.
 * 
 * Detection Strategy:
 * - Production (Vercel, custom domain): API is on the same origin as the frontend
 *   Example: https://rooststay.vercel.app → API at https://rooststay.vercel.app/api
 * - Development (localhost): Uses Vite proxy or explicit VITE_API_URL env var
 *   Example: http://localhost:5173 → API proxied to http://localhost:5000/api
 */

// Detect if we're running in browser or Node.js
const isBrowser = typeof window !== 'undefined';

/**
 * Dynamically determines the API base URL based on the runtime environment.
 * 
 * Production: Uses the same origin as the current page.
 *   If the user visits https://roost.et, the API is at https://roost.et/api
 *   This works for ANY domain without configuration changes.
 * 
 * Development: Falls back to environment variable or localhost proxy.
 *   The Vite dev server proxies /api requests to the backend automatically.
 * 
 * @returns {string} The API base URL
 */
const getApiBaseUrl = () => {
  // Browser environment - detect from current page URL
  if (isBrowser) {
    const currentOrigin = window.location.origin;
    
    // Production: same origin (e.g., https://rooststay.vercel.app)
    if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
      return `${currentOrigin}/api`;
    }
    
    // Development: check for explicit override first, then use proxy
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Default development URL (Vite proxies this to backend)
    return 'http://localhost:5000/api';
  }
  
  // Node.js environment - use environment variable or default
  if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }
  
  return process.env?.API_URL || 'http://localhost:5000/api';
};

/**
 * Helper to read environment variables safely in both browser and Node.js.
 * Vite exposes env vars via import.meta.env with VITE_ prefix.
 * Node.js uses process.env directly.
 * 
 * @param {string} key - Environment variable name
 * @param {*} fallback - Default value if not set
 * @returns {*} The environment variable value or fallback
 */
const getEnv = (key, fallback) => {
  if (isBrowser) {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || fallback;
    }
    return fallback;
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  
  return fallback;
};

const appConfig = {
  brand: {
    name: 'ROOST',
    fullName: 'Reservations Of Other Spaces and Things',
    tagline: 'Find Your Space in Ethiopia',
    domain: 'roost.et',
    email: 'support@roost.et',
    phone: '+251-000-000-000',
  },

  api: {
    // Dynamic URL detection - never hardcoded for production
    baseUrl: getApiBaseUrl(),
    timeout: 15000,
  },

  platform: {
    defaultLanguage: 'en',
    defaultCurrency: 'ETB',
    itemsPerPage: 12,
  },

  seo: {
    title: 'ROOST - Ethiopian Space Rental',
    description: 'Find unique spaces across Ethiopia. Book securely with local payment methods.',
    image: '/images/og.jpg',
  },
};

export default appConfig;