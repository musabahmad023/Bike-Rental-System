import User from '../models/User.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get current user profile
 * @route   GET /api/profile
 * @access  Private
 */
export const getCurrentProfile = async (req, res, next) => {
  try {
    // User is already available from auth middleware
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.getProfile());
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      email,
      password,
      phoneNumber,
      address,
      preferences,
      profilePicture
    } = req.body;
    
    // Find the user
    const user = await User.findById(req.user._id);
    
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
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (profilePicture) user.profilePicture = profilePicture;
    
    // Update password if provided
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }
    
    // Update address if provided
    if (address) {
      user.address = {
        ...user.address,
        ...address
      };
    }
    
    // Update preferences if provided
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }
    
    // Save updated user
    await user.save();
    
    // Return updated profile without sensitive information
    res.json({
      message: 'Profile updated successfully',
      user: user.getProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user payment methods
 * @route   PUT /api/profile/payment-methods
 * @access  Private
 */
export const updatePaymentMethods = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { paymentMethod, isDefault } = req.body;
    
    // Find the user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If setting as default, unset any existing default
    if (isDefault) {
      user.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }
    
    // Add new payment method
    user.paymentMethods.push({
      type: paymentMethod.type,
      lastFour: paymentMethod.lastFour,
      isDefault: isDefault || false
    });
    
    // Save updated user
    await user.save();
    
    // Return updated payment methods
    res.json({
      message: 'Payment method added successfully',
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user payment method
 * @route   DELETE /api/profile/payment-methods/:methodId
 * @access  Private
 */
export const deletePaymentMethod = async (req, res, next) => {
  try {
    const { methodId } = req.params;
    
    // Find the user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find payment method index
    const methodIndex = user.paymentMethods.findIndex(
      method => method._id.toString() === methodId
    );
    
    if (methodIndex === -1) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    // Remove the payment method
    user.paymentMethods.splice(methodIndex, 1);
    
    // Save updated user
    await user.save();
    
    res.json({
      message: 'Payment method removed successfully',
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/profile/password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Find the user with password
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    
    // Save updated user (password will be hashed by pre-save hook)
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
