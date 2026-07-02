// apps/api/src/utils/AppError.js

/**
 * @file utils/AppError.js
 * @description Custom error class for consistent error handling across the application.
 * Extends the native Error class to include HTTP status codes and operational flags.
 */

/**
 * Custom error class for application-specific errors
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create an application error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} [isOperational=true] - Whether this is an operational error (expected) or programmer error
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;