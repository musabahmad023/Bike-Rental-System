import Booking from '../models/Booking.js';
import Bike from '../models/Bike.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Check bike availability for given dates
 * @route   GET /api/bookings/check-availability
 * @access  Public
 */
export const checkBikeAvailability = async (req, res) => {
  try {
    console.log('Checking bike availability:', req.query);
    
    const { bikeId, startDate, endDate } = req.query;
    
    if (!bikeId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Bike ID, start date, and end date are required'
      });
    }
    
    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)'
      });
    }
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Check if bike exists
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }
    
    // Check if bike is available (not in maintenance or reserved)
    if (bike.availability.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Bike is currently ${bike.availability.status}`
      });
    }
    
    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      bike: bikeId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        // Case 1: Start date falls within an existing booking
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    
    if (overlappingBookings.length > 0) {
      // Format the conflicting dates for the response
      const conflicts = overlappingBookings.map(booking => ({
        startDate: booking.startDate,
        endDate: booking.endDate
      }));
      
      return res.status(200).json({
        success: false,
        available: false,
        message: 'Bike is not available for the selected dates',
        conflicts
      });
    }
    
    // Calculate rental duration and price
    const diffMs = Math.abs(end - start);
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    let price = 0;
    if (diffHours <= 24) {
      // Use hourly rate for bookings under 24 hours
      price = diffHours * bike.pricing.hourlyRate;
    } else {
      // Use daily rate for bookings over 24 hours
      const days = Math.ceil(diffHours / 24);
      price = days * bike.pricing.dailyRate;
    }
    
    console.log(`Bike ${bikeId} is available for the requested dates`);
    
    res.status(200).json({
      success: true,
      available: true,
      message: 'Bike is available for the selected dates',
      pricing: {
        hours: diffHours,
        totalPrice: price,
        deposit: bike.pricing.deposit,
        hourlyRate: bike.pricing.hourlyRate,
        dailyRate: bike.pricing.dailyRate
      }
    });
  } catch (error) {
    console.error('Error checking bike availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check bike availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req, res) => {
  try {
    console.log('Creating new booking:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      bikeId,
      startDate,
      endDate,
      paymentMethod,
      pickupLocation,
      returnLocation,
      additionalServices,
      notes
    } = req.body;
    
    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)'
      });
    }
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Check if bike exists and is available
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }
    
    // Check if bike is available (not in maintenance or reserved)
    if (bike.availability.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Bike is currently ${bike.availability.status}`
      });
    }
    
    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      bike: bikeId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        // Start date falls within an existing booking
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    
    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bike is not available for the selected dates'
      });
    }
    
    // Calculate rental duration and price
    const diffMs = Math.abs(end - start);
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    let price = 0;
    if (diffHours <= 24) {
      // Use hourly rate for bookings under 24 hours
      price = diffHours * bike.pricing.hourlyRate;
    } else {
      // Use daily rate for bookings over 24 hours
      const days = Math.ceil(diffHours / 24);
      price = days * bike.pricing.dailyRate;
    }
    
    // Add prices for additional services
    let additionalServicesData = [];
    if (additionalServices && additionalServices.length > 0) {
      additionalServicesData = additionalServices;
      const additionalServicesTotal = additionalServicesData.reduce(
        (total, service) => total + service.price, 0
      );
      price += additionalServicesTotal;
    }
    
    // Create the booking
    const booking = new Booking({
      user: req.user._id,
      bike: bikeId,
      startDate: start,
      endDate: end,
      totalHours: diffHours,
      totalPrice: price,
      paymentMethod: paymentMethod || 'credit_card',
      pickupLocation: pickupLocation || bike.availability.location,
      returnLocation: returnLocation || bike.availability.location,
      additionalServices: additionalServicesData,
      notes,
      status: 'pending'
    });
    
    // Save the booking
    const createdBooking = await booking.save();
    
    // Update bike availability status to 'reserved'
    bike.availability.status = 'reserved';
    await bike.save();
    
    console.log(`Booking created successfully with ID: ${createdBooking._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: createdBooking._id,
        bikeId: createdBooking.bike,
        startDate: createdBooking.startDate,
        endDate: createdBooking.endDate,
        totalHours: createdBooking.totalHours,
        totalPrice: createdBooking.totalPrice,
        status: createdBooking.status,
        paymentStatus: createdBooking.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all bookings for a user
 * @route   GET /api/bookings
 * @access  Private
 */
export const getUserBookings = async (req, res) => {
  try {
    console.log(`Fetching bookings for user: ${req.user._id}`);
    
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const bookings = await Booking.find(filter)
      .populate('bike', 'name type images pricing')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);
    
    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    
    console.log(`Found ${bookings.length} bookings for user ${req.user._id}`);
    
    // Format response
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      bike: {
        id: booking.bike._id,
        name: booking.bike.name,
        type: booking.bike.type,
        image: booking.bike.images[0],
        hourlyRate: booking.bike.pricing.hourlyRate,
        dailyRate: booking.bike.pricing.dailyRate
      },
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt
    }));
    
    res.json({
      success: true,
      bookings: formattedBookings,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBookingById = async (req, res) => {
  try {
    console.log(`Fetching booking with ID: ${req.params.id}`);
    
    const booking = await Booking.findById(req.params.id)
      .populate('bike', 'name type images specifications pricing availability condition')
      .populate('user', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if the booking belongs to the user or if user is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    console.log(`Booking found: ${booking._id}`);
    
    // Format response
    const formattedBooking = {
      id: booking._id,
      user: {
        id: booking.user._id,
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone
      },
      bike: {
        id: booking.bike._id,
        name: booking.bike.name,
        type: booking.bike.type,
        images: booking.bike.images,
        specifications: booking.bike.specifications,
        condition: booking.bike.condition
      },
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      depositPaid: booking.depositPaid,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      pickupLocation: booking.pickupLocation,
      returnLocation: booking.returnLocation,
      additionalServices: booking.additionalServices,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
    
    res.json({
      success: true,
      booking: formattedBooking
    });
  } catch (error) {
    console.error(`Error fetching booking ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private
 */
export const updateBookingStatus = async (req, res) => {
  try {
    console.log(`Updating status for booking ID: ${req.params.id}`);
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if the booking belongs to the user or if user is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    // Handle cancellation
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const { cancellationReason } = req.body;
      
      booking.status = 'cancelled';
      booking.cancellationReason = cancellationReason || 'No reason provided';
      booking.cancellationDate = Date.now();
      
      // Calculate refund amount based on cancellation policy
      // For example, full refund if cancelled more than 24 hours before start
      const now = new Date();
      const startDate = new Date(booking.startDate);
      const hoursUntilStart = Math.abs(startDate - now) / (1000 * 60 * 60);
      
      if (hoursUntilStart > 24) {
        booking.refundAmount = booking.totalPrice;
      } else {
        // 50% refund if cancelled less than 24 hours before start
        booking.refundAmount = booking.totalPrice * 0.5;
      }
      
      // Update bike availability status back to 'available'
      const bike = await Bike.findById(booking.bike);
      if (bike) {
        bike.availability.status = 'available';
        await bike.save();
        console.log(`Bike ${bike._id} status updated to available`);
      }
    } 
    // Handle other status changes
    else {
      booking.status = status;
      
      // Update bike availability status based on booking status
      const bike = await Bike.findById(booking.bike);
      if (bike) {
        if (status === 'confirmed') {
          bike.availability.status = 'reserved';
        } else if (status === 'active') {
          bike.availability.status = 'rented';
        } else if (status === 'completed') {
          bike.availability.status = 'available';
        }
        
        await bike.save();
        console.log(`Bike ${bike._id} status updated to ${bike.availability.status}`);
      }
    }
    
    const updatedBooking = await booking.save();
    console.log(`Booking status updated to: ${updatedBooking.status}`);
    
    res.json({
      success: true,
      message: `Booking status updated to ${updatedBooking.status}`,
      booking: {
        id: updatedBooking._id,
        status: updatedBooking.status,
        updatedAt: updatedBooking.updatedAt
      }
    });
  } catch (error) {
    console.error(`Error updating booking status ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/bookings/:id/payment
 * @access  Private
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    console.log(`Updating payment status for booking ID: ${req.params.id}`);
    
    const { paymentStatus, paymentMethod, depositPaid } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required'
      });
    }
    
    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'refunded', 'failed'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`
      });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Only admin can update payment status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payment status'
      });
    }
    
    booking.paymentStatus = paymentStatus;
    
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }
    
    if (depositPaid !== undefined) {
      booking.depositPaid = depositPaid;
    }
    
    // If payment is successful, update booking status to confirmed
    if (paymentStatus === 'paid' && booking.status === 'pending') {
      booking.status = 'confirmed';
      
      // Update bike availability status to 'reserved'
      const bike = await Bike.findById(booking.bike);
      if (bike) {
        bike.availability.status = 'reserved';
        await bike.save();
        console.log(`Bike ${bike._id} status updated to reserved`);
      }
    }
    
    const updatedBooking = await booking.save();
    console.log(`Booking payment status updated to: ${updatedBooking.paymentStatus}`);
    
    res.json({
      success: true,
      message: `Payment status updated to ${updatedBooking.paymentStatus}`,
      booking: {
        id: updatedBooking._id,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        paymentMethod: updatedBooking.paymentMethod,
        depositPaid: updatedBooking.depositPaid,
        updatedAt: updatedBooking.updatedAt
      }
    });
  } catch (error) {
    console.error(`Error updating payment status ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all bookings (admin only)
 * @route   GET /api/bookings/admin
 * @access  Private/Admin
 */
export const getAllBookings = async (req, res) => {
  try {
    console.log('Fetching all bookings (admin)');
    
    const { 
      status, 
      bikeId, 
      userId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (bikeId) {
      filter.bike = bikeId;
    }
    
    if (userId) {
      filter.user = userId;
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      filter.$or = [
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        {
          endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      ];
    }
    
    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const bookings = await Booking.find(filter)
      .populate('bike', 'name type images pricing')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);
    
    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    
    console.log(`Found ${bookings.length} bookings out of ${total} total`);
    
    // Format response
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      user: {
        id: booking.user._id,
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone
      },
      bike: {
        id: booking.bike._id,
        name: booking.bike.name,
        type: booking.bike.type,
        image: booking.bike.images[0]
      },
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt
    }));
    
    res.json({
      success: true,
      bookings: formattedBookings,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
