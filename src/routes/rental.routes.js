import express from 'express';
import { check } from 'express-validator';
import { 
  createRental, 
  getUserRentals, 
  getRentalById, 
  updateRentalStatus, 
  addRentalFeedback,
  getAllRentals
} from '../controllers/rental.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   POST /api/rentals
// @desc    Create a new rental
// @access  Private
router.post(
  '/',
  [
    protect,
    check('bikeId', 'Bike ID is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601().toDate(),
    check('endDate', 'End date is required').isISO8601().toDate(),
    check('paymentMethod', 'Payment method is required').isIn(['credit_card', 'paypal', 'cash', 'other'])
  ],
  createRental
);

// @route   GET /api/rentals
// @desc    Get all rentals for the logged-in user
// @access  Private
router.get('/', protect, getUserRentals);

// @route   GET /api/rentals/admin
// @desc    Get all rentals (admin only)
// @access  Private/Admin
router.get('/admin', protect, admin, getAllRentals);

// @route   GET /api/rentals/:id
// @desc    Get rental by ID
// @access  Private
router.get('/:id', protect, getRentalById);

// @route   PUT /api/rentals/:id/status
// @desc    Update rental status
// @access  Private/Admin
router.put(
  '/:id/status',
  [
    protect,
    admin,
    check('status', 'Status is required').isIn(['pending', 'active', 'completed', 'cancelled', 'overdue'])
  ],
  updateRentalStatus
);

// @route   POST /api/rentals/:id/feedback
// @desc    Add feedback to rental
// @access  Private
router.post(
  '/:id/feedback',
  [
    protect,
    check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty()
  ],
  addRentalFeedback
);

export default router;
