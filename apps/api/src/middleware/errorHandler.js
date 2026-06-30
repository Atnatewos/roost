// apps/api/src/middleware/errorHandler.js

import AppError from '../utils/AppError.js';

/**
 * Global error handling middleware.
 * Catches all errors thrown in the application and returns
 * a standardized JSON error response.
 */

/**
 * Handles Prisma-specific database errors
 */
const handlePrismaError = (err) => {
  // Unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return new AppError(`A record with this ${field} already exists.`, 409);
  }
  // Record not found
  if (err.code === 'P2025') {
    return new AppError('The requested record was not found.', 404);
  }
  return err;
};

/**
 * Handles JWT-specific errors
 */
const handleJWTError = () => 
  new AppError('Invalid authentication token. Please log in again.', 401);

const handleTokenExpiredError = () => 
  new AppError('Your session has expired. Please log in again.', 401);

const errorHandler = (err, req, res, next) => {
  // Default to internal server error
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Handle known error types
  let error = { ...err, message: err.message };

  if (err.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  }
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleTokenExpiredError();
  }

  // Log errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: err.stack,
    });
  }

  // Don't leak error details in production for unexpected errors
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    error.message = 'Something went wrong. Please try again later.';
    error.statusCode = 500;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;