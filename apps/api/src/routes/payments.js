// apps/api/src/routes/payments.js

import { Router } from 'express';
import { uploadPaymentProof, getPaymentStatus } from '../controllers/payments.js';
import authenticate from '../middleware/auth.js';

/**
 * Payment routes.
 * All payment operations require authentication.
 */

const router = Router();

router.use(authenticate);

router.post('/:bookingId/proof', uploadPaymentProof);
router.get('/:bookingId/status', getPaymentStatus);

export default router;