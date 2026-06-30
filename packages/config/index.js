// packages/config/index.js

import appConfig from './src/app.js';
import theme from './src/theme.js';
import listingConfig from './src/listing.js';
import paymentConfig from './src/payment.js';
import features from './src/features.js';
import routes from './src/routes.js';

/**
 * ROOST Shared Configuration
 * 
 * All platform configuration values are centralized here.
 * 
 * IMPORTANT: Environment variables for the frontend MUST be prefixed
 * with VITE_ to be exposed by Vite. For example:
 * - VITE_API_URL (not API_URL)
 * - VITE_CLOUDINARY_CLOUD_NAME (not CLOUDINARY_CLOUD_NAME)
 */

export {
  appConfig,
  theme,
  listingConfig,
  paymentConfig,
  features,
  routes,
};