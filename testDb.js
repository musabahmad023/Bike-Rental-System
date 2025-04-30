import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import seedDatabase from './src/config/seedData.js'; // Ensure the correct path and extension

// Your MongoDB connection and seeding logic goes here


const testDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Seed the database with test data
    const testData = await seedDatabase();
    console.log('\nTest data created successfully!');
    
    // Perform some test queries
    console.log('\nPerforming test queries:');
    
    // Test Course Query
    const course = await mongoose.model('Course').findById(testData.course._id)
      .populate('instructorId');
    console.log('\nCourse Details:');
    console.log(`Title: ${course.title}`);
    console.log(`Instructor: ${course.instructorId.name}`);
    console.log(`Level: ${course.level}`);
    
    // Test Lessons Query
    const lessons = await mongoose.model('Lesson').find({ courseId: course._id })
      .sort({ order: 1 });
    console.log('\nLessons:');
    lessons.forEach(lesson => {
      console.log(`${lesson.order}. ${lesson.title} (${lesson.duration} minutes)`);
    });

    console.log('\nDatabase test completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the test
testDatabase();
