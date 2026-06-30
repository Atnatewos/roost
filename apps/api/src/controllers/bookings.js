// apps/api/src/controllers/bookings.js

import { prisma } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Calculate the total price for a booking.
 * Applies weekly and monthly discounts if applicable.
 *
 * @param {Object} listing - Listing with pricing details
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {number} Total price in ETB
 */
const calculateTotalPrice = (listing, checkIn, checkOut) => {
  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) {
    throw new AppError('Check-out date must be after check-in date.', 400);
  }

  let subtotal = listing.basePrice * nights;
  const cleaningFee = listing.cleaningFee || 0;

  // Apply weekly discount (7+ nights)
  if (nights >= 7 && listing.weeklyDiscount > 0) {
    subtotal = subtotal * (1 - listing.weeklyDiscount / 100);
  }

  // Apply monthly discount (28+ nights)
  if (nights >= 28 && listing.monthlyDiscount > 0) {
    subtotal = subtotal * (1 - listing.monthlyDiscount / 100);
  }

  return Math.round((subtotal + cleaningFee) * 100) / 100;
};

/**
 * Create a new booking request.
 * Validates dates, guest count, and calculates the total price.
 * The guest is automatically set to the authenticated user.
 */
export const createBooking = catchAsync(async (req, res) => {
  const { listingId, checkIn, checkOut, guestCount, specialRequests, paymentMethod } = req.body;

  // Verify the listing exists and is active
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: 'ACTIVE' },
  });

  if (!listing) {
    throw new AppError('Listing not found or is not available for booking.', 404);
  }

  // Prevent hosts from booking their own listings
  if (listing.hostId === req.user.id) {
    throw new AppError('You cannot book your own listing.', 400);
  }

  // Validate guest count against listing capacity
  if (guestCount > listing.maxGuests) {
    throw new AppError(
      `This listing can only accommodate up to ${listing.maxGuests} guests.`,
      400
    );
  }

  // Check for date conflicts with existing confirmed bookings
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      listingId,
      status: { in: ['CONFIRMED', 'PAYMENT_CONFIRMED'] },
      OR: [
        {
          checkIn: { lte: new Date(checkOut) },
          checkOut: { gte: new Date(checkIn) },
        },
      ],
    },
  });

  if (conflictingBooking) {
    throw new AppError(
      'The selected dates are not available. Please choose different dates.',
      409
    );
  }

  // Calculate the total price
  const totalPrice = calculateTotalPrice(listing, checkIn, checkOut);

  const booking = await prisma.booking.create({
    data: {
      listingId,
      guestId: req.user.id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestCount: parseInt(guestCount, 10),
      totalPrice,
      specialRequests: specialRequests?.trim() || null,
      paymentMethod: paymentMethod || null,
      status: 'PENDING_PAYMENT',
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  });

  res.status(201).json(
    ApiResponse.success(
      { booking },
      'Booking request created. Please complete payment to confirm.',
      201
    )
  );
});

/**
 * Get all bookings for the authenticated user.
 * Guests see their bookings, hosts see bookings for their listings.
 */
export const getMyBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 50);
  const skip = (pageNum - 1) * limitNum;

  const where = {};

  // Guests see their own bookings, hosts see bookings for their listings
  if (req.user.role === 'HOST') {
    where.listing = { hostId: req.user.id };
  } else {
    where.guestId = req.user.id;
  }

  if (status) {
    where.status = status;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
        guest: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  res.json(
    ApiResponse.paginated(bookings, pageNum, limitNum, total)
  );
});

/**
 * Get a single booking by ID.
 * Only the booking's guest or the listing's host can view it.
 */
export const getBooking = catchAsync(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: 'asc' } },
          host: { select: { id: true, fullName: true, phone: true } },
        },
      },
      guest: { select: { id: true, fullName: true, phone: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  // Verify the requester is either the guest or the host
  const isGuest = booking.guestId === req.user.id;
  const isHost = booking.listing.hostId === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isGuest && !isHost && !isAdmin) {
    throw new AppError('You do not have permission to view this booking.', 403);
  }

  res.json(
    ApiResponse.success({ booking }, 'Booking retrieved successfully.')
  );
});

/**
 * Cancel a booking.
 * Only the guest can cancel, and only if the booking hasn't started yet.
 */
export const cancelBooking = catchAsync(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findFirst({
    where: { id, guestId: req.user.id },
  });

  if (!booking) {
    throw new AppError('Booking not found or you do not have permission.', 404);
  }

  // Prevent cancellation of already completed or cancelled bookings
  const nonCancellable = ['COMPLETED', 'CANCELLED'];
  if (nonCancellable.includes(booking.status)) {
    throw new AppError(
      `Cannot cancel a booking that is already ${booking.status.toLowerCase()}.`,
      400
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  res.json(
    ApiResponse.success(
      { booking: updatedBooking },
      'Booking cancelled successfully.'
    )
  );
});