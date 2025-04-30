import Rental from '../models/Rental.js';
import Bike from '../models/Bike.js';
import { validationResult } from 'express-validator';

// @desc    Create a new rental
// @route   POST /api/rentals
// @access  Private
export const createRental = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      bikeId,
      startDate,
      endDate,
      pickupLocation,
      returnLocation,
      additionalEquipment,
      paymentMethod,
      notes
    } = req.body;

    // Check if bike exists and is available
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    if (bike.availability.status !== 'available') {
      return res.status(400).json({ message: 'Bike is not available for rent' });
    }

    // Calculate rental duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInMs = end - start;
    const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));

    if (durationInDays < 1) {
      return res.status(400).json({ message: 'Rental duration must be at least 1 day' });
    }

    // Calculate pricing
    let basePrice = 0;
    if (durationInDays === 1) {
      basePrice = bike.pricing.dailyRate;
    } else if (durationInDays >= 7) {
      basePrice = bike.pricing.weeklyRate 
        ? bike.pricing.weeklyRate * Math.floor(durationInDays / 7) + bike.pricing.dailyRate * (durationInDays % 7)
        : bike.pricing.dailyRate * durationInDays;
    } else {
      basePrice = bike.pricing.dailyRate * durationInDays;
    }

    // Add cost of additional equipment
    let equipmentCost = 0;
    if (additionalEquipment && additionalEquipment.length > 0) {
      equipmentCost = additionalEquipment.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    }

    // Calculate tax (assuming 10% tax rate)
    const taxRate = 0.10;
    const tax = (basePrice + equipmentCost) * taxRate;

    // Calculate total amount
    const totalAmount = basePrice + equipmentCost + tax;

    // Create the rental
    const rental = new Rental({
      userId: req.user._id,
      bikeId,
      startDate,
      endDate,
      status: 'pending',
      pricing: {
        basePrice,
        deposit: bike.pricing.deposit,
        discount: 0, // Can be updated later with promo codes
        tax,
        totalAmount
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      pickupLocation: pickupLocation || bike.availability.location,
      returnLocation: returnLocation || bike.availability.location,
      additionalEquipment: additionalEquipment || [],
      notes
    });

    const createdRental = await rental.save();

    // Update bike availability status to 'reserved'
    bike.availability.status = 'reserved';
    await bike.save();

    res.status(201).json(createdRental);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rentals for the logged-in user
// @route   GET /api/rentals
// @access  Private
export const getUserRentals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { userId: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const rentals = await Rental.find(filter)
      .populate('bikeId', 'name type images pricing')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);
    
    // Get total count for pagination
    const total = await Rental.countDocuments(filter);
    
    res.json({
      rentals,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rental by ID
// @route   GET /api/rentals/:id
// @access  Private
export const getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('bikeId', 'name type images pricing specifications')
      .populate('userId', 'name email phoneNumber');
    
    // Check if rental exists and belongs to the user (unless admin)
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    
    if (rental.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this rental' });
    }
    
    res.json(rental);
  } catch (error) {
    next(error);
  }
};

// @desc    Update rental status
// @route   PUT /api/rentals/:id/status
// @access  Private/Admin
export const updateRentalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'active', 'completed', 'cancelled', 'overdue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const rental = await Rental.findById(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    
    // Update rental status
    rental.status = status;
    
    // If rental is completed or cancelled, update bike availability
    if (status === 'completed' || status === 'cancelled') {
      const bike = await Bike.findById(rental.bikeId);
      if (bike) {
        bike.availability.status = 'available';
        await bike.save();
      }
      
      // If completed, set return date
      if (status === 'completed') {
        rental.returnDate = Date.now();
      }
    }
    
    // If rental is activated, update bike status to rented
    if (status === 'active') {
      const bike = await Bike.findById(rental.bikeId);
      if (bike) {
        bike.availability.status = 'rented';
        await bike.save();
      }
    }
    
    const updatedRental = await rental.save();
    res.json(updatedRental);
  } catch (error) {
    next(error);
  }
};

// @desc    Add feedback to rental
// @route   POST /api/rentals/:id/feedback
// @access  Private
export const addRentalFeedback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { rating, comment } = req.body;
    
    const rental = await Rental.findById(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    
    // Check if rental belongs to the user
    if (rental.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add feedback to this rental' });
    }
    
    // Check if rental is completed
    if (rental.status !== 'completed') {
      return res.status(400).json({ message: 'Can only add feedback to completed rentals' });
    }
    
    // Check if feedback already exists
    if (rental.feedback.rating) {
      return res.status(400).json({ message: 'Feedback already submitted for this rental' });
    }
    
    // Add feedback to rental
    rental.feedback = {
      rating: Number(rating),
      comment,
      submittedAt: Date.now()
    };
    
    await rental.save();
    
    // Update bike rating
    const bike = await Bike.findById(rental.bikeId);
    if (bike) {
      // Add review to bike
      const review = {
        userId: req.user._id,
        rating: Number(rating),
        comment,
        date: Date.now()
      };
      
      bike.reviews.push(review);
      
      // Update bike rating average and count
      bike.ratings.count = bike.reviews.length;
      bike.ratings.average = bike.reviews.reduce((acc, item) => item.rating + acc, 0) / bike.reviews.length;
      
      await bike.save();
    }
    
    res.json({ message: 'Feedback added successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rentals (admin only)
// @route   GET /api/rentals/admin
// @access  Private/Admin
export const getAllRentals = async (req, res, next) => {
  try {
    const { 
      status, 
      userId, 
      bikeId, 
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
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (bikeId) {
      filter.bikeId = bikeId;
    }
    
    if (startDate) {
      filter.startDate = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      filter.endDate = { $lte: new Date(endDate) };
    }
    
    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const rentals = await Rental.find(filter)
      .populate('bikeId', 'name type images')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);
    
    // Get total count for pagination
    const total = await Rental.countDocuments(filter);
    
    res.json({
      rentals,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    next(error);
  }
};
