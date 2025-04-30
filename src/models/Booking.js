import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalHours: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  depositPaid: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'other'],
    default: 'credit_card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
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
  additionalServices: [{
    name: String,
    price: Number
  }],
  notes: {
    type: String
  },
  cancellationReason: {
    type: String
  },
  cancellationDate: {
    type: Date
  },
  refundAmount: {
    type: Number
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
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ bike: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, startDate: 1 });

// Pre-save hook to calculate total hours and price
bookingSchema.pre('save', async function(next) {
  if (this.isModified('startDate') || this.isModified('endDate')) {
    // Calculate total hours
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffMs = Math.abs(end - start);
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    this.totalHours = diffHours;

    // If bike is referenced, calculate price
    if (this.bike && this.isModified('bike') || this.isNew) {
      try {
        const Bike = mongoose.model('Bike');
        const bike = await Bike.findById(this.bike);
        
        if (bike) {
          // Calculate price based on hourly or daily rate
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
          if (this.additionalServices && this.additionalServices.length > 0) {
            const additionalServicesTotal = this.additionalServices.reduce(
              (total, service) => total + service.price, 0
            );
            price += additionalServicesTotal;
          }
          
          this.totalPrice = price;
        }
      } catch (error) {
        console.error('Error calculating booking price:', error);
      }
    }
  }
  
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
