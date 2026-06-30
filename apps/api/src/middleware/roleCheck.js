// apps/api/src/middleware/roleCheck.js

import AppError from '../utils/AppError.js';

/**
 * Role-based authorization middleware factory.
 * Creates middleware that restricts access to specified roles.
 *
 * @param {...string} roles - Allowed role names
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // authenticate middleware must run before this
    if (!req.user) {
      return next(new AppError('Authentication required before authorization.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};

export default authorize;