// apps/api/src/controllers/auth.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, jwtConfig } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Generate a JWT token for authenticated users.
 * The token payload contains the minimum necessary user data
 * required for authorization checks in middleware.
 *
 * @param {Object} user - User record from the database
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
  });
};

/**
 * Sanitize user object before sending to client.
 * Removes sensitive fields that should never leave the server.
 *
 * @param {Object} user - Raw user record from database
 * @returns {Object} Sanitized user object safe for client consumption
 */
const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Register a new user account.
 * Validates unique email/phone, hashes password with bcrypt,
 * and returns a JWT token for immediate authentication.
 */
export const register = catchAsync(async (req, res) => {
  const { email, phone, password, fullName } = req.body;

  // Check for existing user with same email or phone
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase().trim() },
        { phone: phone.trim() },
      ],
    },
  });

  if (existingUser) {
    const field = existingUser.email === email.toLowerCase().trim() ? 'email' : 'phone';
    throw new AppError(`An account with this ${field} already exists.`, 409);
  }

  // Hash password with a randomly generated salt (12 rounds)
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with default GUEST role
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      fullName: fullName.trim(),
      role: 'GUEST',
    },
  });

  // Generate authentication token
  const token = generateToken(user);

  res.status(201).json(
    ApiResponse.success(
      {
        user: sanitizeUser(user),
        token,
      },
      'Account created successfully. Welcome to ROOST!',
      201
    )
  );
});

/**
 * Authenticate an existing user.
 * Verifies email and password, returns JWT token on success.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email (case-insensitive)
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Use generic error message to prevent user enumeration
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Compare provided password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Generate fresh token for this session
  const token = generateToken(user);

  res.json(
    ApiResponse.success(
      {
        user: sanitizeUser(user),
        token,
      },
      'Welcome back!'
    )
  );
});

/**
 * Return the currently authenticated user's profile.
 * Requires valid JWT token in the Authorization header.
 * Used by the client to restore session state on page refresh.
 */
export const getCurrentUser = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.json(
    ApiResponse.success(
      { user: sanitizeUser(user) },
      'Profile retrieved successfully.'
    )
  );
});

/**
 * Update the authenticated user's profile.
 * Only allows updating non-sensitive fields.
 * Prevents role escalation and email changes without verification.
 */
export const updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['fullName', 'phone', 'avatar'];
  const updates = {};

  // Filter request body to only allowed fields
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field].trim();
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields provided for update.', 400);
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: updates,
  });

  res.json(
    ApiResponse.success(
      { user: sanitizeUser(user) },
      'Profile updated successfully.'
    )
  );
});