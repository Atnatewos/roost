// apps/api/src/middleware/auth.js

import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/index.js';
import AppError from '../utils/AppError.js';

/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header
 * and attaches the decoded user payload to the request object.
 */
const authenticate = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Authentication token is missing.', 401));
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid authentication token.', 401));
    }
    return next(new AppError('Authentication failed.', 401));
  }
};

export default authenticate;