// apps/api/src/routes/admin.js

import { Router } from 'express';
import {
  verifyListing,
  confirmPayment,
  getDashboardStats,
  getUsers,
} from '../controllers/admin.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

/**
 * Admin routes.
 * All routes require ADMIN role authorization.
 */

const router = Router();

// All admin routes require authentication AND admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.patch('/listings/:listingId/verify', verifyListing);
router.patch('/payments/:bookingId/confirm', confirmPayment);

export default router;