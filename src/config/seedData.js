import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Certificate from '../models/Certificate.js';

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Certificate.deleteMany({});

    // Create test users
    const instructor = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah@vocalmaster.com',
      password: 'password123',
      role: 'instructor',
      profileDetails: {
        bio: 'Professional vocal coach with 10 years of experience',
        expertise: ['Classical', 'Pop', 'Jazz'],
        socialLinks: {
          youtube: 'https://youtube.com/sarahjohnson'
        }
      }
    });

    const student = await User.create({
      name: 'Mike Smith',
      email: 'mike@example.com',
      password: 'password123',
      role: 'student',
      profileDetails: {
        interests: ['Pop Music', 'Rock'],
        bio: 'Aspiring singer'
      }
    });

    // Create test course
    const course = await Course.create({
      title: 'Fundamentals of Vocal Training',
      description: 'Master the basics of vocal technique',
      instructorId: instructor._id,
      category: 'Vocal Technique',
      level: 'beginner',
      duration: 600, // 10 hours
      price: {
        amount: 99.99,
        currency: 'USD'
      },
      overview: {
        objectives: [
          'Understand proper breathing techniques',
          'Develop pitch control',
          'Master basic vocal exercises'
        ],
        requirements: ['No prior experience needed'],
        targetAudience: ['Beginner singers', 'Music enthusiasts']
      },
      status: 'published'
    });

    // Create test lessons
    const lessons = await Lesson.create([
      {
        courseId: course._id,
        moduleId: 'module1',
        title: 'Introduction to Breathing Techniques',
        description: 'Learn the fundamentals of proper breathing for singing',
        order: 1,
        duration: 45,
        content: {
          type: 'video',
          video: {
            url: 'https://example.com/lesson1.mp4',
            duration: 2700, // 45 minutes
            thumbnailUrl: 'https://example.com/thumbnail1.jpg'
          }
        },
        practiceGuidelines: {
          instructions: 'Practice these breathing exercises daily',
          warmupExercises: [
            {
              title: 'Diaphragmatic Breathing',
              description: 'Focus on breathing from your diaphragm',
              duration: 10,
              audioUrl: 'https://example.com/warmup1.mp3'
            }
          ]
        },
        status: 'published'
      },
      {
        courseId: course._id,
        moduleId: 'module1',
        title: 'Pitch Control Basics',
        description: 'Master the fundamentals of pitch control',
        order: 2,
        duration: 60,
        content: {
          type: 'video',
          video: {
            url: 'https://example.com/lesson2.mp4',
            duration: 3600,
            thumbnailUrl: 'https://example.com/thumbnail2.jpg'
          }
        },
        practiceGuidelines: {
          instructions: 'Practice pitch matching exercises',
          warmupExercises: [
            {
              title: 'Scale Exercises',
              description: 'Practice major scales',
              duration: 15,
              audioUrl: 'https://example.com/warmup2.mp3'
            }
          ]
        },
        status: 'published'
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('Test Accounts:');
    console.log(`Instructor - Email: ${instructor.email}, Password: password123`);
    console.log(`Student - Email: ${student.email}, Password: password123`);
    
    return {
      instructor,
      student,
      course,
      lessons
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;