// apps/api/src/controllers/payments.js

import { prisma } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Upload payment proof for a booking.
 * Accepts a screenshot URL and updates the booking status.
 * The booking must be in PENDING_PAYMENT status.
 */
export const uploadPaymentProof = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const { paymentProof, transactionId, paymentMethod } = req.body;

  // Verify the booking exists and belongs to the authenticated user
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      guestId: req.user.id,
      status: 'PENDING_PAYMENT',
    },
  });

  if (!booking) {
    throw new AppError(
      'Booking not found or payment has already been submitted.',
      404
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentProof: paymentProof || null,
      transactionId: transactionId || null,
      paymentMethod: paymentMethod || 'manual',
      status: 'PAYMENT_UPLOADED',
    },
  });

  res.json(
    ApiResponse.success(
      { booking: updatedBooking },
      'Payment proof uploaded successfully. Awaiting verification.'
    )
  );
});

/**
 * Get payment status for a booking.
 * Returns the current status and payment details.
 */
export const getPaymentStatus = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, guestId: req.user.id },
    select: {
      id: true,
      status: true,
      totalPrice: true,
      paymentMethod: true,
      paymentProof: true,
      transactionId: true,
    },
  });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  res.json(
    ApiResponse.success({ payment: booking }, 'Payment status retrieved.')
  );
});