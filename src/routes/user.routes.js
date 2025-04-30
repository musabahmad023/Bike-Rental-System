import express from 'express';
import { check } from 'express-validator';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getUserStats
} from '../controllers/user.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, admin, getUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get('/stats', protect, admin, getUserStats);

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', protect, admin, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put(
  '/:id',
  [
    protect,
    admin,
    check('name', 'Name must not be empty if provided').optional().not().isEmpty(),
    check('email', 'Please include a valid email if provided').optional().isEmail(),
    check('role', 'Role must be valid if provided').optional().isIn(['customer', 'admin']),
    check('password', 'Password must be at least 6 characters if provided').optional().isLength({ min: 6 })
  ],
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteUser);

export default router;
