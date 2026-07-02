// apps/api/src/middleware/auth.js

/**
 * @file middleware/auth.js
 * @description Authentication middleware that extracts JWT from HttpOnly cookies.
 * Provides both default export (authenticate) and named export (protect) for flexibility.
 */

import jwt from 'jsonwebtoken';
import { prisma, jwtConfig } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Middleware to protect routes. Verifies JWT from HttpOnly cookie.
 */
const authenticate = catchAsync(async (req, res, next) => {
  let token;

  // Extract token from HttpOnly cookie
  if (req.cookies && req.cookies.roost_token) {
    token = req.cookies.roost_token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!req.user) {
      return next(new AppError('User no longer exists', 401));
    }

    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
});

export default authenticate;
export { authenticate as protect };