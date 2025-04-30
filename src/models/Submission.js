import mongoose from 'mongoose';
const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  submittedAudio: {
    url: {
      type: String,
      required: true
    },
    duration: Number,
    format: String,
    size: Number, // in bytes
    waveformData: String
  },
  feedback: {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    timestampedComments: [{
      timestamp: Number,
      comment: String
    }],
    metrics: {
      pitchAccuracy: {
        type: Number,
        min: 0,
        max: 100
      },
      rhythm: {
        type: Number,
        min: 0,
        max: 100
      },
      breathing: {
        type: Number,
        min: 0,
        max: 100
      },
      expression: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    providedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'needs-revision'],
    default: 'pending'
  },
  attempts: {
    type: Number,
    default: 1
  },
  previousSubmissions: [{
    audioUrl: String,
    submittedAt: Date,
    feedback: {
      rating: Number,
      comments: String,
      metrics: {
        pitchAccuracy: Number,
        rhythm: Number,
        breathing: Number,
        expression: Number
      }
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  submittedAt: {
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
submissionSchema.index({ studentId: 1, lessonId: 1 });
submissionSchema.index({ courseId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: 1 });
submissionSchema.index({ 'feedback.instructorId': 1 });

// Calculate average metrics
submissionSchema.methods.getAverageMetrics = function() {
  const metrics = this.feedback.metrics;
  if (!metrics) return null;
  
  return {
    average: (
      metrics.pitchAccuracy +
      metrics.rhythm +
      metrics.breathing +
      metrics.expression
    ) / 4,
    individual: metrics
  };
};

// Track submission history
submissionSchema.pre('save', function(next) {
  if (this.isModified('submittedAudio') && !this.isNew) {
    const previousSubmission = {
      audioUrl: this.submittedAudio.url,
      submittedAt: this.submittedAt,
      feedback: this.feedback
    };
    
    if (!this.previousSubmissions) {
      this.previousSubmissions = [];
    }
    
    this.previousSubmissions.push(previousSubmission);
    this.attempts += 1;
  }
  next();
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;