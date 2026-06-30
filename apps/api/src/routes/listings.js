// apps/api/src/routes/listings.js

import { Router } from 'express';
import {
  createListing,
  getListings,
  getListing,
  uploadListingImages,
  updateListing,
  deleteListing,
} from '../controllers/listings.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';
import { uploadMultiple } from '../middleware/upload.js';

/**
 * Listing routes.
 * Public read access, authenticated write access for hosts.
 */

const router = Router();

// Public routes
router.get('/', getListings);
router.get('/:slug', getListing);

// Host-only routes
router.post('/', authenticate, authorize('HOST', 'ADMIN'), createListing);
router.patch('/:id', authenticate, authorize('HOST', 'ADMIN'), updateListing);
router.delete('/:id', authenticate, authorize('HOST', 'ADMIN'), deleteListing);

// Image upload (host only)
router.post(
  '/:listingId/images',
  authenticate,
  authorize('HOST', 'ADMIN'),
  uploadMultiple,
  uploadListingImages
);

export default router;