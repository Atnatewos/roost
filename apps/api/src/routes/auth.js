// apps/api/src/routes/auth.js

/**
 * @file routes/auth.js
 * @description Authentication routes with proper middleware chain
 */

import { Router } from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  logout, 
  getAuthStatus,
  upgradeToHost
} from '../controllers/auth.js';
import authenticate from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Silent auth check
router.get('/status', getAuthStatus);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, updateProfile);
router.patch('/become-host', authenticate, upgradeToHost);
router.get('/logout', authenticate, logout);

export default router;