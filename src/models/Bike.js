import mongoose from 'mongoose';

const bikeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['mountain', 'road', 'city', 'electric', 'hybrid', 'kids'],
    index: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  specifications: {
    frameSize: String,
    frameType: String,
    wheelSize: String,
    color: String,
    weight: Number,
    gears: Number,
    suspension: String,
    brakeType: String
  },
  pricing: {
    hourlyRate: {
      type: Number,
      required: true
    },
    dailyRate: {
      type: Number,
      required: true
    },
    weeklyRate: {
      type: Number
    },
    deposit: {
      type: Number,
      required: true
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance', 'reserved'],
      default: 'available',
      index: true
    },
    location: {
      name: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs maintenance'],
    default: 'excellent'
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    description: String,
    performedBy: String,
    cost: Number
  }],
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
bikeSchema.index({ 'pricing.hourlyRate': 1 });
bikeSchema.index({ 'pricing.dailyRate': 1 });
bikeSchema.index({ 'ratings.average': -1 });
bikeSchema.index({ type: 1, 'availability.status': 1 });

const Bike = mongoose.model('Bike', bikeSchema);

export default Bike;
