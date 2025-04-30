import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify token and set req.user
export const protect = async (req, res, next) => {
  try {
    console.log('Authenticating request:', { 
      path: req.originalUrl,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization
    });
    
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      if (!token) {
        console.log('Authentication failed: Token missing after Bearer prefix');
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized, token missing' 
        });
      }
      
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', { userId: decoded.id });
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          console.log('Authentication failed: User not found for token');
          return res.status(401).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
        
        // Set user in request object
        req.user = user;
        next();
      } catch (error) {
        console.error('Token verification failed:', error.message);
        
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            success: false, 
            message: 'Token expired, please login again' 
          });
        }
        
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
          });
        }
        
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized, token failed',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } else {
      console.log('Authentication failed: No authorization header');
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access granted:', { userId: req.user._id });
    next();
  } else {
    console.log('Admin access denied:', { 
      userId: req.user?._id, 
      role: req.user?.role 
    });
    res.status(403).json({ 
      success: false, 
      message: 'Not authorized as an admin' 
    });
  }
};

// Role-based access control middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Role authorization failed: No user in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log('Role authorization failed:', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles
      });
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }
    
    console.log('Role authorization successful:', {
      userId: req.user._id,
      role: req.user.role
    });
    next();
  };
};
