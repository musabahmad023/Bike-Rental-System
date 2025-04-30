import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  moduleId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  content: {
    type: {
      type: String,
      enum: ['video', 'audio', 'text', 'mixed'],
      required: true
    },
    video: {
      url: String,
      duration: Number,
      thumbnailUrl: String,
      captions: [{
        language: String,
        url: String
      }]
    },
    audio: {
      url: String,
      duration: Number,
      waveformData: String
    },
    text: {
      content: String,
      attachments: [{
        name: String,
        url: String,
        type: String
      }]
    }
  },
  practiceGuidelines: {
    instructions: String,
    warmupExercises: [{
      title: String,
      description: String,
      duration: Number,
      audioUrl: String
    }],
    mainExercises: [{
      title: String,
      description: String,
      duration: Number,
      audioUrl: String,
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
      }
    }],
    tips: [String],
    expectedOutcomes: [String]
  },
  resources: [{
    title: String,
    type: String,
    url: String,
    description: String
  }],
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    passingScore: Number
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  tags: [String],
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
lessonSchema.index({ courseId: 1, order: 1 });
lessonSchema.index({ title: 'text', description: 'text' });
lessonSchema.index({ status: 1 });
lessonSchema.index({ moduleId: 1 });
lessonSchema.index({ 'content.type': 1 });
lessonSchema.index({ tags: 1 });

// Virtual for average completion time
lessonSchema.virtual('averageCompletionTime').get(function() {
  // Implementation would be based on actual user completion data
  return this.duration;
});

const Lesson = mongoose.model('Lesson', lessonSchema);


export default Lesson;