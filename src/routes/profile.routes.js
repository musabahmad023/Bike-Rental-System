import express from 'express';
import { check } from 'express-validator';
import {
  getCurrentProfile,
  updateProfile,
  updatePaymentMethods,
  deletePaymentMethod,
  changePassword
} from '../controllers/profile.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', protect, getCurrentProfile);

// @route   PUT /api/profile
// @desc    Update current user profile
// @access  Private
router.put(
  '/',
  [
    protect,
    check('name', 'Name must not be empty if provided').optional().not().isEmpty(),
    check('email', 'Please include a valid email if provided').optional().isEmail(),
    check('password', 'Password must be at least 6 characters if provided').optional().isLength({ min: 6 }),
    check('phoneNumber', 'Phone number is invalid').optional().isMobilePhone()
  ],
  updateProfile
);

// @route   PUT /api/profile/password
// @desc    Change user password
// @access  Private
router.put(
  '/password',
  [
    protect,
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  changePassword
);

// @route   PUT /api/profile/payment-methods
// @desc    Update user payment methods
// @access  Private
router.put(
  '/payment-methods',
  [
    protect,
    check('paymentMethod', 'Payment method information is required').not().isEmpty(),
    check('paymentMethod.type', 'Payment method type is required').isIn(['credit_card', 'paypal', 'other']),
    check('paymentMethod.lastFour', 'Last four digits are required for payment method').isLength({ min: 4, max: 4 })
  ],
  updatePaymentMethods
);

// @route   DELETE /api/profile/payment-methods/:methodId
// @desc    Delete user payment method
// @access  Private
router.delete('/payment-methods/:methodId', protect, deletePaymentMethod);

export default router;
