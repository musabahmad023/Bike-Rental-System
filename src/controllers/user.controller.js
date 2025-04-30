import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { validationResult } from 'express-validator';

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', role } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Filter by role if provided
    if (role && ['customer', 'admin'].includes(role)) {
      filter.role = role;
    }
    
    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Determine sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query
    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort(sort)
      .limit(limitNum)
      .skip(skip);
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
      filters: {
        search: search || '',
        role: role || 'all',
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's bookings
    const bookings = await Booking.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('bike', 'name');
    
    res.json({
      ...user.toObject(),
      bookings: bookings || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, role, password, isVerified, phoneNumber, address } = req.body;
    
    // Find the user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = password; // Will be hashed by pre-save hook
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    // Update address if provided
    if (address) {
      user.address = {
        ...user.address,
        ...address
      };
    }
    
    // Save updated user
    const updatedUser = await user.save();
    
    res.json({
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting your own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    // Check if user has any active bookings
    const activeBookings = await Booking.countDocuments({
      user: req.params.id,
      status: { $in: ['pending', 'confirmed', 'active'] }
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with active bookings. Cancel or complete all bookings first.',
        activeBookings
      });
    }
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics (admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res, next) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    // Get new users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get monthly user registration for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format monthly stats
    const formattedMonthlyStats = monthlyStats.map(stat => {
      const date = new Date(stat._id.year, stat._id.month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        year: stat._id.year,
        count: stat.count
      };
    });
    
    res.json({
      totalUsers,
      totalCustomers,
      totalAdmins,
      verifiedUsers,
      newUsersLast30Days: newUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : 0,
      monthlyRegistrations: formattedMonthlyStats
    });
  } catch (error) {
    next(error);
  }
};
