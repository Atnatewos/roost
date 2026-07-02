// apps/api/src/config/index.js

/**
 * @file config/index.js
 * @description Centralized configuration management and service initialization.
 * Single source of truth for all environment variables and service instances.
 * Eliminates duplicate configurations and ensures zero hardcoded values.
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

/**
 * Configuration object containing all environment variables
 * Parsed and validated for type safety
 */
const config = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173'],
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 20971520,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};

/**
 * Validate critical environment variables in production
 * Prevents silent failures when deploying to Vercel
 */
if (config.nodeEnv === 'production') {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'CLOUDINARY_API_SECRET', 'REDIS_URL'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}

/**
 * Prisma client instance with connection pooling for Neon
 * Uses global scope to prevent multiple instances in development (hot reload)
 */
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Cloudinary configuration and instance
 * Single source of truth for Cloudinary credentials
 */
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure: true,
});

/**
 * JWT configuration object
 * Centralized JWT settings for consistent token generation and verification
 */
const jwtConfig = {
  secret: config.jwtSecret,
  expiresIn: config.jwtExpiresIn,
  issuer: 'roost-api',
};

/**
 * Cloudinary upload configuration
 * Default settings for image uploads
 */
const cloudinaryUploadConfig = {
  folder: 'roost/listings',
  resource_type: 'image',
  quality: 'auto',
  fetch_format: 'auto',
};

export default config;
export { prisma, cloudinary, jwtConfig, cloudinaryUploadConfig };