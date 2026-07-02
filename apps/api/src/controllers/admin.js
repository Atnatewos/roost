// apps/api/src/controllers/admin.js

/**
 * @file controllers/admin.js
 * @description Administrative controllers for platform management.
 */

import { prisma } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Get all listings with optional status filtering.
 * Admins can see listings in any state (PENDING, ACTIVE, SUSPENDED).
 */
export const getAllListings = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 100);
  const skip = (pageNum - 1) * limitNum;
  
  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: { id: true, fullName: true, email: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);
  
  res.json(
    ApiResponse.paginated(listings, pageNum, limitNum, total)
  );
});

/**
 * Update the status of a listing (Approve, Suspend, etc.).
 */
export const updateListingStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status provided.', 400);
  }
  
  const listing = await prisma.listing.update({
    where: { id },
    data: { status },
  });
  
  res.json(
    ApiResponse.success({ listing }, 'Listing status updated successfully.')
  );
});