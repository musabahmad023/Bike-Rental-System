import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike',
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'overdue'],
    default: 'pending',
    index: true
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'paypal', 'cash', 'other'],
      required: true
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'failed'],
      default: 'pending'
    },
    paidAt: Date
  },
  pickupLocation: {
    name: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  returnLocation: {
    name: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  additionalEquipment: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  notes: String,
  damageReport: {
    hasDamage: {
      type: Boolean,
      default: false
    },
    description: String,
    images: [String],
    repairCost: Number
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
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

// Create compound indexes for common queries
rentalSchema.index({ userId: 1, status: 1 });
rentalSchema.index({ bikeId: 1, status: 1 });
rentalSchema.index({ startDate: 1, endDate: 1 });

const Rental = mongoose.model('Rental', rentalSchema);

export default Rental;
