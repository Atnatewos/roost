// apps/api/src/routes/auth.js

import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/auth.js';
import authenticate from '../middleware/auth.js';

/**
 * Authentication routes.
 * Public routes for login/register, protected routes for profile management.
 */

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require valid JWT)
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, updateProfile);

export default router;