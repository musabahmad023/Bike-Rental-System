import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  certificateURL: {
    type: String,
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  metadata: {
    courseName: String,
    studentName: String,
    instructorName: String,
    courseCompletionDate: Date,
    grade: String,
    hoursCompleted: Number
  },
  achievements: [{
    title: String,
    description: String,
    awardedDate: Date
  }],
  verificationDetails: {
    verificationUrl: String,
    blockchain: {
      transactionHash: String,
      blockNumber: Number,
      timestamp: Date
    }
  },
  downloads: [{
    downloadDate: Date,
    ipAddress: String,
    userAgent: String
  }],
  shareHistory: [{
    platform: String,
    sharedDate: Date,
    status: String
  }],
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
certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ certificateNumber: 1 }, { unique: true });
certificateSchema.index({ status: 1 });
certificateSchema.index({ issuedDate: 1 });
certificateSchema.index({ 'verificationDetails.blockchain.transactionHash': 1 });

// Generate unique certificate number
certificateSchema.pre('save', async function(next) {
  if (this.isNew) {
    const prefix = 'CERT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.certificateNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to verify certificate authenticity
certificateSchema.methods.verifyCertificate = async function() {
  // Implementation would depend on the verification system used
  // (blockchain, digital signatures, etc.)
  return {
    isValid: true,
    verificationDetails: this.verificationDetails
  };
};

// Method to track certificate download
certificateSchema.methods.trackDownload = function(ipAddress, userAgent) {
  this.downloads.push({
    downloadDate: new Date(),
    ipAddress,
    userAgent
  });
  return this.save();
};

// Method to share certificate
certificateSchema.methods.shareCertificate = function(platform) {
  this.shareHistory.push({
    platform,
    sharedDate: new Date(),
    status: 'shared'
  });
  return this.save();
};

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;