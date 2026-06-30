// apps/api/src/config/jwt.js

/**
 * JWT authentication configuration.
 * All values sourced from environment variables with safe defaults.
 */
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'roost-dev-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  issuer: 'roost-api',
};

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error(
    'FATAL: JWT_SECRET is not set in production environment. ' +
    'This is a critical security risk.'
  );
  process.exit(1);
}

export default jwtConfig;