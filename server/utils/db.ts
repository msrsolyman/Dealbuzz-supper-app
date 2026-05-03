import mongoose from 'mongoose';

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI environment variable is missing.');
    console.warn('⚠️ Database endpoints will fail. Please supply MONGODB_URI in secrets or .env file.');
    return;
  }

  // To prevent multiple connections or warning
  if (mongoose.connection.readyState === 1) return;

  try {
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferTimeoutMS', 2000);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
