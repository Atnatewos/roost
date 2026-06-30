import app from '../apps/api/src/app.js';

/**
 * Vercel Serverless Function Handler
 * Exports the Express app for Vercel's serverless runtime.
 * All /api/* requests from the frontend get routed here.
 */
export default app;
