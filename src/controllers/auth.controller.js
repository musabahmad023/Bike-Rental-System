import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

// Generate access token (short-lived)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h' // Short lived token - 1 hour
  });
};

// Generate refresh token (long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Long lived token - 30 days
  });
};

// Generate both tokens
const generateTokens = (id) => {
  return {
    accessToken: generateAccessToken(id),
    refreshToken: generateRefreshToken(id)
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, phoneNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Registration failed: User already exists', { email });
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user with all provided fields
    const userData = {
      name,
      email,
      password, // Will be hashed by pre-save hook in User model
      role: role || 'customer'
    };
    
    // Add optional fields if provided
    if (phoneNumber) userData.phoneNumber = phoneNumber;
    
    // Create user in database
    const user = await User.create(userData);

    if (user) {
      console.log('User registered successfully:', { id: user._id, email: user.email });
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || '',
        token: accessToken
      });
    } else {
      console.log('Registration failed: Invalid user data');
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email - explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('Login failed: User not found', { email });
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      console.log('User logged in successfully:', { id: user._id, email: user.email });
      
      // Update last login
      user.lastLogin = Date.now();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: accessToken
      });
    } else {
      console.log('Login failed: Invalid password', { email });
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    console.log('Logout attempt:', { userId: req.user?._id });
    
    // Clear the refresh token in the database
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = '';
      await user.save();
      console.log('User logged out successfully:', { id: user._id });
    }

    // Clear the cookie
    res.clearCookie('refreshToken');
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with refresh token)
export const refreshToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      console.log('Token refresh failed: No refresh token in cookies');
      return res.status(401).json({ success: false, message: 'Refresh token not found' });
    }
    
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      console.log('Refresh token verified for user:', { userId: decoded.id });
      
      // Find user with matching refresh token
      const user = await User.findOne({ 
        _id: decoded.id,
        refreshToken: refreshToken 
      });
      
      if (!user) {
        console.log('Token refresh failed: Invalid refresh token or user not found');
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }
      
      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
      
      // Update refresh token in database
      user.refreshToken = newRefreshToken;
      await user.save();
      
      // Set new refresh token in cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      // Return new access token
      res.json({
        success: true,
        token: accessToken
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Refresh token expired' });
      }
      
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during token refresh',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        address: user.address,
        preferences: user.preferences,
        paymentMethods: user.paymentMethods,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update basic fields if provided
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
    
    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password; // Will be hashed by pre-save hook
    }
    
    // Update address if provided
    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address
      };
    }
    
    // Update preferences if provided
    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences
      };
    }
    
    // Save updated user
    const updatedUser = await user.save();
    
    // Generate new token with updated info
    const { accessToken } = generateTokens(updatedUser._id);
    
    res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      preferences: updatedUser.preferences,
      token: accessToken
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
