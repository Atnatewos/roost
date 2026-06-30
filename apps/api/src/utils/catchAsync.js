// apps/api/src/utils/catchAsync.js

/**
 * Wraps an async route handler to catch rejected promises
 * and forward errors to the Express error handler middleware.
 * Eliminates the need for try-catch blocks in every controller.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function that catches errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;