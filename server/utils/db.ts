import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  let MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI || MONGODB_URI.includes('<password>')) {
    console.warn('⚠️ Invalid or missing MONGODB_URI environment variable.');
    console.warn('⚠️ Starting a local in-memory MongoDB server for testing...');
    if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
    }
    MONGODB_URI = mongoServer.getUri();
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
