// apps/api/src/routes/listings.js

/**
 * @file routes/listings.js
 * @description Listing routes with Multer-based image upload flow.
 */

import { Router } from 'express';
import {
  createListing,
  getListings,
  getListing,
  getHostListings,
  uploadListingImages,
  updateListing,
  deleteListing,
} from '../controllers/listings.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';
import { uploadMultiple } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', getListings);

// Host-only routes (Must be before /:slug)
router.get('/host/my-listings', authenticate, authorize('HOST', 'ADMIN'), getHostListings);
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

// Public route (Must be after specific host routes)
router.get('/:slug', getListing);

export default router;