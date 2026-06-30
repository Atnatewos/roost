// apps/api/src/index.js

import 'dotenv/config';
import app from './app.js';
import { prisma } from './config/index.js';

/**
 * ROOST API Server Entry Point.
 * Works as both a standalone Express server and a Vercel serverless function.
 * When deployed on Vercel, the serverless runtime calls the exported handler.
 * In development, it starts a regular Express server on the configured port.
 */

const PORT = process.env.PORT || 5000;

// Connect to database and start server (development mode)
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`ROOST API server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// In development, start the Express server normally
if (process.env.NODE_ENV !== 'production') {
  startServer();
}

// Export the Express app for Vercel serverless deployment
// Vercel wraps this in a serverless function handler automatically
export default app;