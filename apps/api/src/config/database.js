// apps/api/src/config/database.js

/**
 * @file config/database.js
 * @description Prisma client configuration with connection pooling for Neon
 * Prevents connection exhaustion on Vercel serverless
 */

import { PrismaClient } from '@prisma/client';
import config from './index.js';

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

export default prisma;