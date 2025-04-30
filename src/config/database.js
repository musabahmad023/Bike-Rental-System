import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    // Set up connection error handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    // Create text indexes for search functionality
    try {
      // Only attempt to create indexes if models are registered
      const models = mongoose.modelNames();
      console.log('Registered models:', models);
      
      const indexPromises = [];
      
      if (models.includes('Bike')) {
        indexPromises.push(
          mongoose.model('Bike').collection.createIndex(
            { name: 'text', description: 'text', type: 'text' },
            { background: true }
          )
        );
      }
      
      if (models.includes('User')) {
        indexPromises.push(
          mongoose.model('User').collection.createIndex(
            { name: 'text', email: 'text' },
            { background: true }
          )
        );
      }
      
      if (models.includes('Rental')) {
        indexPromises.push(
          mongoose.model('Rental').collection.createIndex(
            { status: 'text' },
            { background: true }
          )
        );
      }
      
      if (indexPromises.length > 0) {
        await Promise.all(indexPromises);
        console.log('Text indexes created successfully');
      } else {
        console.log('No models available for index creation yet');
      }
    } catch (indexError) {
      console.warn('Index creation error:', indexError.message);
      console.log('Index creation will be handled after models are registered');
    }
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error(`- Message: ${error.message}`);
    console.error(`- Code: ${error.code}`);
    console.error(`- Stack: ${error.stack}`);
    
    // Don't exit the process here, let the caller handle it
    throw error;
  }
};

export default connectDB;