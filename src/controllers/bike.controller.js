import Bike from '../models/Bike.js';
import { validationResult } from 'express-validator';

// @desc    Get all bikes with filtering
// @route   GET /api/bikes
// @access  Public
export const getBikes = async (req, res, next) => {
  try {
    console.log('Fetching bikes with query params:', req.query);
    
    const { 
      type, 
      status, 
      minPrice, 
      maxPrice, 
      location,
      sortBy,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter['availability.status'] = status;
    } else {
      // By default, only show available bikes
      filter['availability.status'] = 'available';
    }
    
    if (minPrice) {
      filter['pricing.hourlyRate'] = { $gte: Number(minPrice) };
    }
    
    if (maxPrice) {
      filter['pricing.hourlyRate'] = { 
        ...filter['pricing.hourlyRate'] || {},
        $lte: Number(maxPrice) 
      };
    }
    
    if (location) {
      filter['availability.location.name'] = { $regex: location, $options: 'i' };
    }
    
    // Build sort object
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          sort = { 'pricing.hourlyRate': 1 };
          break;
        case 'price_desc':
          sort = { 'pricing.hourlyRate': -1 };
          break;
        case 'rating':
          sort = { 'ratings.average': -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { 'ratings.average': -1 };
      }
    } else {
      // Default sort by rating
      sort = { 'ratings.average': -1 };
    }
    
    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    console.log('Executing bike query with filter:', filter);
    
    // Execute query
    const bikes = await Bike.find(filter)
      .sort(sort)
      .limit(limitNum)
      .skip(skip);
    
    // Get total count for pagination
    const total = await Bike.countDocuments(filter);
    
    console.log(`Found ${bikes.length} bikes out of ${total} total`);
    
    // Format response to include simplified bike data
    const formattedBikes = bikes.map(bike => ({
      id: bike._id,
      name: bike.name,
      type: bike.type,
      price: {
        hourly: bike.pricing.hourlyRate,
        daily: bike.pricing.dailyRate
      },
      availability_status: bike.availability.status,
      image: bike.images[0],
      rating: bike.ratings.average,
      description: bike.description.substring(0, 100) + (bike.description.length > 100 ? '...' : '')
    }));
    
    res.json({
      success: true,
      bikes: formattedBikes,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error('Error fetching bikes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bikes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single bike by ID
// @route   GET /api/bikes/:id
// @access  Public
export const getBikeById = async (req, res, next) => {
  try {
    console.log(`Fetching bike with ID: ${req.params.id}`);
    
    const bike = await Bike.findById(req.params.id)
      .populate('reviews.userId', 'name profilePicture');
    
    if (bike) {
      console.log(`Bike found: ${bike.name}`);
      
      // Format response to match required structure
      const formattedBike = {
        id: bike._id,
        name: bike.name,
        type: bike.type,
        price: {
          hourly: bike.pricing.hourlyRate,
          daily: bike.pricing.dailyRate,
          weekly: bike.pricing.weeklyRate,
          deposit: bike.pricing.deposit
        },
        availability_status: bike.availability.status,
        description: bike.description,
        images: bike.images,
        specifications: bike.specifications,
        condition: bike.condition,
        location: bike.availability.location,
        ratings: bike.ratings,
        reviews: bike.reviews,
        maintenanceHistory: bike.maintenanceHistory,
        createdAt: bike.createdAt,
        updatedAt: bike.updatedAt
      };
      
      res.json({
        success: true,
        bike: formattedBike
      });
    } else {
      console.log(`Bike not found with ID: ${req.params.id}`);
      res.status(404).json({ 
        success: false, 
        message: 'Bike not found' 
      });
    }
  } catch (error) {
    console.error(`Error fetching bike ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bike details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create a new bike
// @route   POST /api/bikes
// @access  Private/Admin
export const createBike = async (req, res, next) => {
  try {
    console.log('Creating new bike:', req.body.name);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const {
      name,
      type,
      description,
      images,
      specifications,
      pricing,
      availability,
      condition
    } = req.body;
    
    // Create bike with required fields
    const bikeData = {
      name,
      type,
      description: description || `${name} - ${type} bike`,
      images: images || ['https://via.placeholder.com/300x200?text=Bike+Image'],
      pricing: {
        hourlyRate: pricing?.hourlyRate || 10,
        dailyRate: pricing?.dailyRate || 50,
        deposit: pricing?.deposit || 100,
        ...(pricing?.weeklyRate && { weeklyRate: pricing.weeklyRate })
      },
      availability: {
        status: availability?.status || 'available',
        location: availability?.location || {
          name: 'Main Store',
          address: '123 Bike Street, Bikeville'
        }
      },
      condition: condition || 'excellent',
      addedBy: req.user._id
    };
    
    // Add specifications if provided
    if (specifications) {
      bikeData.specifications = specifications;
    }
    
    const bike = new Bike(bikeData);
    
    const createdBike = await bike.save();
    console.log(`Bike created successfully with ID: ${createdBike._id}`);
    
    // Format response to match required structure
    const formattedBike = {
      id: createdBike._id,
      name: createdBike.name,
      type: createdBike.type,
      price: {
        hourly: createdBike.pricing.hourlyRate,
        daily: createdBike.pricing.dailyRate
      },
      availability_status: createdBike.availability.status,
      description: createdBike.description
    };
    
    res.status(201).json({
      success: true,
      message: 'Bike created successfully',
      bike: formattedBike
    });
  } catch (error) {
    console.error('Error creating bike:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create bike',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update a bike
// @route   PUT /api/bikes/:id
// @access  Private/Admin
export const updateBike = async (req, res, next) => {
  try {
    console.log(`Updating bike with ID: ${req.params.id}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const bike = await Bike.findById(req.params.id);
    
    if (bike) {
      console.log(`Found bike to update: ${bike.name}`);
      
      // Update basic fields if provided
      bike.name = req.body.name || bike.name;
      bike.type = req.body.type || bike.type;
      bike.description = req.body.description || bike.description;
      
      // Update images if provided
      if (req.body.images) {
        bike.images = req.body.images;
      }
      
      // Update specifications if provided
      if (req.body.specifications) {
        bike.specifications = {
          ...bike.specifications,
          ...req.body.specifications
        };
      }
      
      // Update pricing if provided
      if (req.body.pricing) {
        bike.pricing = {
          ...bike.pricing,
          ...req.body.pricing
        };
      }
      
      // Update availability status if provided
      if (req.body.availability_status) {
        bike.availability.status = req.body.availability_status;
      } else if (req.body.availability && req.body.availability.status) {
        bike.availability.status = req.body.availability.status;
      }
      
      // Update full availability object if provided
      if (req.body.availability && typeof req.body.availability === 'object') {
        bike.availability = {
          ...bike.availability,
          ...req.body.availability
        };
      }
      
      // Update condition if provided
      bike.condition = req.body.condition || bike.condition;
      
      // Add maintenance record if provided
      if (req.body.maintenance) {
        bike.maintenanceHistory.push({
          date: req.body.maintenance.date || Date.now(),
          description: req.body.maintenance.description,
          performedBy: req.body.maintenance.performedBy || req.user.name,
          cost: req.body.maintenance.cost
        });
      }
      
      const updatedBike = await bike.save();
      console.log(`Bike updated successfully: ${updatedBike.name}`);
      
      // Format response to match required structure
      const formattedBike = {
        id: updatedBike._id,
        name: updatedBike.name,
        type: updatedBike.type,
        price: {
          hourly: updatedBike.pricing.hourlyRate,
          daily: updatedBike.pricing.dailyRate
        },
        availability_status: updatedBike.availability.status,
        description: updatedBike.description
      };
      
      res.json({
        success: true,
        message: 'Bike updated successfully',
        bike: formattedBike
      });
    } else {
      console.log(`Bike not found with ID: ${req.params.id}`);
      res.status(404).json({ 
        success: false, 
        message: 'Bike not found' 
      });
    }
  } catch (error) {
    console.error(`Error updating bike ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update bike',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete a bike
// @route   DELETE /api/bikes/:id
// @access  Private/Admin
export const deleteBike = async (req, res, next) => {
  try {
    console.log(`Attempting to delete bike with ID: ${req.params.id}`);
    
    const bike = await Bike.findById(req.params.id);
    
    if (bike) {
      const bikeName = bike.name;
      
      // Use deleteOne instead of remove (which is deprecated)
      await Bike.deleteOne({ _id: req.params.id });
      
      console.log(`Bike deleted successfully: ${bikeName}`);
      res.json({ 
        success: true, 
        message: 'Bike removed successfully',
        id: req.params.id
      });
    } else {
      console.log(`Bike not found with ID: ${req.params.id}`);
      res.status(404).json({ 
        success: false, 
        message: 'Bike not found' 
      });
    }
  } catch (error) {
    console.error(`Error deleting bike ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete bike',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new review
// @route   POST /api/bikes/:id/reviews
// @access  Private
export const createBikeReview = async (req, res, next) => {
  try {
    console.log(`Adding review to bike ID: ${req.params.id} by user: ${req.user._id}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { rating, comment } = req.body;
    
    const bike = await Bike.findById(req.params.id);
    
    if (bike) {
      // Check if user already reviewed this bike
      const alreadyReviewed = bike.reviews.find(
        (review) => review.userId.toString() === req.user._id.toString()
      );
      
      if (alreadyReviewed) {
        console.log(`User ${req.user._id} has already reviewed this bike`);
        return res.status(400).json({ 
          success: false, 
          message: 'Bike already reviewed' 
        });
      }
      
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
      console.log(`Review added successfully to bike: ${bike.name}`);
      
      res.status(201).json({ 
        success: true, 
        message: 'Review added successfully' 
      });
    } else {
      console.log(`Bike not found with ID: ${req.params.id}`);
      res.status(404).json({ 
        success: false, 
        message: 'Bike not found' 
      });
    }
  } catch (error) {
    console.error(`Error adding review to bike ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get bike inventory summary
// @route   GET /api/bikes/inventory/summary
// @access  Private/Admin
export const getBikeInventorySummary = async (req, res, next) => {
  try {
    console.log('Fetching bike inventory summary');
    
    // Get counts by status
    const statusCounts = await Bike.aggregate([
      {
        $group: {
          _id: '$availability.status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get counts by type
    const typeCounts = await Bike.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get bikes needing maintenance
    const maintenanceNeeded = await Bike.countDocuments({
      condition: 'needs maintenance'
    });
    
    // Format the response
    const formattedStatusCounts = {};
    statusCounts.forEach(status => {
      formattedStatusCounts[status._id] = status.count;
    });
    
    const formattedTypeCounts = {};
    typeCounts.forEach(type => {
      formattedTypeCounts[type._id] = type.count;
    });
    
    console.log('Inventory summary generated successfully');
    
    res.json({
      success: true,
      summary: {
        total: await Bike.countDocuments(),
        byStatus: formattedStatusCounts,
        byType: formattedTypeCounts,
        maintenanceNeeded
      }
    });
  } catch (error) {
    console.error('Error generating inventory summary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate inventory summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
