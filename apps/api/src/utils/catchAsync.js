// apps/api/src/utils/catchAsync.js

/**
 * @file utils/catchAsync.js
 * @description Async error handling wrapper for Express route handlers.
 * Eliminates the need for try-catch blocks in every controller by automatically
 * catching rejected promises and passing errors to Express's error handling middleware.
 */

/**
 * Wraps an async route handler to catch any rejected promises
 * and pass them to the next() error handler
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function with error handling
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;