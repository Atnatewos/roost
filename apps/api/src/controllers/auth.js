// apps/api/src/controllers/auth.js

/**
 * @file controllers/auth.js
 * @description Handles user authentication, profile management, and role upgrades.
 * Implements HttpOnly cookies for secure JWT storage to prevent XSS token theft.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, jwtConfig } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Generate a JWT token for authenticated users
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
 * Set JWT in HttpOnly cookie
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  res
    .status(statusCode)
    .cookie('roost_token', token, cookieOptions)
    .json(
      ApiResponse.success(
        {
          user: sanitizeUser(user),
        },
        'Authentication successful'
      )
    );
};

/**
 * Sanitize user object before sending to client
 */
const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Register a new user account
 */
export const register = catchAsync(async (req, res) => {
  const { email, phone, password, fullName } = req.body;

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

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      fullName: fullName.trim(),
      role: 'GUEST',
    },
  });

  sendTokenResponse(user, 201, res);
});

/**
 * Authenticate an existing user
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  sendTokenResponse(user, 200, res);
});

/**
 * Check authentication status silently without throwing 401.
 */
export const getAuthStatus = catchAsync(async (req, res) => {
  const token = req.cookies?.roost_token;

  if (!token) {
    return res.json(
      ApiResponse.success({ loggedIn: false, user: null }, 'Not authenticated')
    );
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.json(
        ApiResponse.success({ loggedIn: false, user: null }, 'User not found')
      );
    }

    return res.json(
      ApiResponse.success({ loggedIn: true, user }, 'Authenticated')
    );
  } catch (error) {
    return res.json(
      ApiResponse.success({ loggedIn: false, user: null }, 'Invalid token')
    );
  }
});

/**
 * Return the currently authenticated user's profile
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
 * Update the authenticated user's profile
 */
export const updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['fullName', 'phone', 'avatar'];
  const updates = {};

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

/**
 * Upgrade an authenticated GUEST user to a HOST.
 * Allows users to seamlessly transition to hosting properties.
 */
export const upgradeToHost = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.role === 'HOST' || user.role === 'ADMIN') {
    throw new AppError('You are already a host.', 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { role: 'HOST' },
  });

  res.json(
    ApiResponse.success(
      { user: sanitizeUser(updatedUser) },
      'Successfully upgraded to Host.'
    )
  );
});

/**
 * Logout - Clear authentication cookie
 */
export const logout = catchAsync(async (req, res) => {
  res
    .status(200)
    .clearCookie('roost_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .json(
      ApiResponse.success(null, 'Logged out successfully')
    );
});