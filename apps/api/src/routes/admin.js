// apps/api/src/routes/admin.js

/**
 * @file routes/admin.js
 * @description Administrative routes for platform management.
 * All routes require authentication and ADMIN role.
 */

import { Router } from 'express';
import { getAllListings, updateListingStatus } from '../controllers/admin.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();

// Apply authentication and ADMIN role check to all admin routes
router.use(authenticate, authorize('ADMIN'));

router.get('/listings', getAllListings);
router.patch('/listings/:id/status', updateListingStatus);

export default router;