// apps/api/src/app.js

/**
 * @file app.js
 * @description Main Express application setup with security hardening,
 * serverless-compatible rate limiting, and CORS configuration.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit, { MemoryStore } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { prisma, cloudinary } from './config/index.js';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration - Must allow credentials for HttpOnly cookies
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : ['http://localhost:5173'];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body & Cookie Parsers
const maxUploadSize = parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 20971520;
app.use(express.json({ limit: maxUploadSize }));
app.use(express.urlencoded({ extended: true, limit: maxUploadSize }));
app.use(cookieParser());

// Serverless-Compatible Rate Limiting
let rateLimitStore;
let redisClient;

if (process.env.NODE_ENV === 'production') {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.connect().catch(console.error);

  rateLimitStore = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
} else {
  rateLimitStore = new MemoryStore();
}

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString() 
  });
});

// Global Error Handler (MUST be last)
app.use(errorHandler);

export default app;