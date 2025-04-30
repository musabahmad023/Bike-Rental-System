import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: {
      values: ['customer', 'admin'],
      message: 'Role must be either customer or admin'
    },
    default: 'customer'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethods: [{
    type: {
      type: String,
      enum: ['credit_card', 'paypal', 'other'],
    },
    lastFour: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    bikeTypes: [String],
    rentalDuration: String,
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  refreshToken: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
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

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    console.log(`Hashing password for user: ${this.email}`);
    
    // Generate a stronger salt (14 rounds instead of 12)
    const salt = await bcrypt.genSalt(14);
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // If password field is not selected, throw error
    if (!this.password) {
      throw new Error('Password field not selected in the query');
    }
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Virtual for user's full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to get user profile (safe data without sensitive info)
userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profilePicture: this.profilePicture,
    phoneNumber: this.phoneNumber,
    address: this.address,
    preferences: this.preferences,
    isVerified: this.isVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;