import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
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
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedLessons: [{
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      },
      completedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  completionStatus: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: Date,
  lastAccessDate: Date,
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    transactionId: String,
    paymentMethod: String,
    paymentDate: Date
  }
}, {
  timestamps: true
});

// Create indexes
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ completionStatus: 1 });
enrollmentSchema.index({ enrollmentDate: 1 });
enrollmentSchema.index({ 'progress.percentage': 1 });
enrollmentSchema.index({ paymentStatus: 1 });

// Update progress percentage when completed lessons change
enrollmentSchema.pre('save', async function(next) {
  if (this.isModified('progress.completedLessons')) {
    try {
      const course = await mongoose.model('Course').findById(this.courseId);
      const totalLessons = course.curriculum.reduce((acc, module) => acc + module.lessons.length, 0);
      const completedLessons = this.progress.completedLessons.length;
      
      this.progress.percentage = (completedLessons / totalLessons) * 100;
      
      // Update completion status
      if (this.progress.percentage === 100) {
        this.completionStatus = 'completed';
        this.completionDate = new Date();
      } else if (this.progress.percentage > 0) {
        this.completionStatus = 'in-progress';
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;