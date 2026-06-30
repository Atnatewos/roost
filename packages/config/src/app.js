// packages/config/src/app.js

/**
 * ROOST Application Configuration
 * 
 * All environment variables used on the frontend must use
 * import.meta.env instead of process.env (Vite requirement).
 * On the backend (Node.js), process.env is used normally.
 * 
 * This file detects the runtime environment and uses the
 * appropriate method to read configuration values.
 */

// Detect if we're running in browser (Vite) or Node.js
const isBrowser = typeof window !== 'undefined';

// Helper to get environment variables in both environments
const getEnv = (key, fallback) => {
  if (isBrowser) {
    // Vite exposes env vars via import.meta.env
    return import.meta.env[key] || fallback;
  }
  // Node.js uses process.env
  return process.env[key] || fallback;
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
    baseUrl: getEnv('VITE_API_URL', 'http://localhost:5000/api'),
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