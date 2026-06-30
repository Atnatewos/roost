// apps/api/src/routes/bookings.js

import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
} from '../controllers/bookings.js';
import authenticate from '../middleware/auth.js';

/**
 * Booking routes.
 * All booking operations require authentication.
 */

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);

export default router;