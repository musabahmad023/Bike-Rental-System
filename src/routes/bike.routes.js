import express from 'express';
import { check } from 'express-validator';
import { 
  getBikes, 
  getBikeById, 
  createBike, 
  updateBike, 
  deleteBike,
  createBikeReview,
  getBikeInventorySummary
} from '../controllers/bike.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/bikes
// @desc    Get all bikes with filtering
// @access  Public
router.get('/', getBikes);

// @route   GET /api/bikes/:id
// @desc    Get single bike by ID
// @access  Public
router.get('/:id', getBikeById);

// @route   POST /api/bikes
// @desc    Create a new bike
// @access  Private/Admin
router.post(
  '/',
  [
    protect,
    admin,
    check('name', 'Name is required').not().isEmpty(),
    check('type', 'Type is required').isIn(['mountain', 'road', 'city', 'electric', 'hybrid', 'kids']),
    check('description', 'Description is required').not().isEmpty(),
    check('images', 'At least one image is required').isArray({ min: 1 }),
    check('pricing.hourlyRate', 'Hourly rate is required').isNumeric(),
    check('pricing.dailyRate', 'Daily rate is required').isNumeric(),
    check('pricing.deposit', 'Deposit amount is required').isNumeric()
  ],
  createBike
);

// @route   PUT /api/bikes/:id
// @desc    Update a bike
// @access  Private/Admin
router.put(
  '/:id',
  [
    protect,
    admin,
    check('name', 'Name must not be empty if provided').optional().not().isEmpty(),
    check('type', 'Type must be valid if provided').optional().isIn(['mountain', 'road', 'city', 'electric', 'hybrid', 'kids']),
    check('description', 'Description must not be empty if provided').optional().not().isEmpty()
  ],
  updateBike
);

// @route   DELETE /api/bikes/:id
// @desc    Delete a bike
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteBike);

// @route   POST /api/bikes/:id/reviews
// @desc    Create new review
// @access  Private
router.post(
  '/:id/reviews',
  [
    protect,
    check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty()
  ],
  createBikeReview
);

// @route   GET /api/bikes/inventory/summary
// @desc    Get bike inventory summary
// @access  Private/Admin
router.get('/inventory/summary', protect, admin, getBikeInventorySummary);

export default router;
