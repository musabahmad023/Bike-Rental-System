import express from 'express';
import { check } from 'express-validator';
import {
  checkBikeAvailability,
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  getAllBookings
} from '../controllers/booking.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/bookings/check-availability
// @desc    Check bike availability for given dates
// @access  Public
router.get('/check-availability', checkBikeAvailability);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post(
  '/',
  [
    protect,
    check('bikeId', 'Bike ID is required').not().isEmpty(),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty()
  ],
  createBooking
);

// @route   GET /api/bookings
// @desc    Get all bookings for a user
// @access  Private
router.get('/', protect, getUserBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking details by ID
// @access  Private
router.get('/:id', protect, getBookingById);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put(
  '/:id/status',
  [
    protect,
    check('status', 'Status is required').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled'])
  ],
  updateBookingStatus
);

// @route   PUT /api/bookings/:id/payment
// @desc    Update payment status
// @access  Private/Admin
router.put(
  '/:id/payment',
  [
    protect,
    admin,
    check('paymentStatus', 'Payment status is required').isIn(['pending', 'paid', 'refunded', 'failed'])
  ],
  updatePaymentStatus
);

// @route   GET /api/bookings/admin
// @desc    Get all bookings (admin only)
// @access  Private/Admin
router.get('/admin', protect, admin, getAllBookings);

export default router;
