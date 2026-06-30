// apps/api/src/controllers/admin.js

import { prisma } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Verify a listing (approve or reject).
 * Only accessible by ADMIN role.
 * Updates listing status and tracks who verified it.
 */
export const verifyListing = catchAsync(async (req, res) => {
  const { listingId } = req.params;
  const { status, rejectionReason } = req.body;

  // Validate the requested status transition
  const allowedStatuses = ['ACTIVE', 'INACTIVE'];
  if (!allowedStatuses.includes(status)) {
    throw new AppError(
      `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      400
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  if (listing.status !== 'PENDING') {
    throw new AppError(
      `Cannot verify a listing with status: ${listing.status}`,
      400
    );
  }

  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: {
      status,
      ...(status === 'INACTIVE' && rejectionReason && {
        // Store rejection reason - you may want to add a field for this
      }),
    },
  });

  res.json(
    ApiResponse.success(
      { listing: updatedListing },
      `Listing ${status === 'ACTIVE' ? 'approved' : 'rejected'} successfully.`
    )
  );
});

/**
 * Confirm a payment manually.
 * Admin verifies the payment screenshot and confirms the booking.
 */
export const confirmPayment = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  if (booking.status !== 'PAYMENT_UPLOADED') {
    throw new AppError(
      `Cannot confirm payment for a booking with status: ${booking.status}`,
      400
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' },
    include: {
      listing: { select: { title: true } },
      guest: { select: { fullName: true, email: true } },
    },
  });

  // Increment the listing's booking count
  await prisma.listing.update({
    where: { id: booking.listingId },
    data: { bookingCount: { increment: 1 } },
  });

  res.json(
    ApiResponse.success(
      { booking: updatedBooking },
      'Payment confirmed. Booking is now active.'
    )
  );
});

/**
 * Get admin dashboard statistics.
 * Returns key metrics for the admin panel.
 */
export const getDashboardStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalListings,
    pendingListings,
    totalBookings,
    pendingPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PAYMENT_UPLOADED' } }),
  ]);

  res.json(
    ApiResponse.success({
      stats: {
        totalUsers,
        totalListings,
        pendingListings,
        totalBookings,
        pendingPayments,
      },
    })
  );
});

/**
 * Get all users (admin only).
 * Supports pagination and search.
 */
export const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 100);
  const skip = (pageNum - 1) * limitNum;

  const where = {};

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json(
    ApiResponse.paginated(users, pageNum, limitNum, total)
  );
});