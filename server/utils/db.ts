import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  let MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI || MONGODB_URI.includes('<password>')) {
    if (process.env.NODE_ENV === 'production') {
       console.error('❌ MONGODB_URI is missing in production! Server will likely fail to perform DB operations.');
       return;
    }
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
    mongoose.set('bufferTimeoutMS', 5000);
    
    console.log(`Connecting to MongoDB at ${MONGODB_URI.split('@').pop()}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('CRITICAL: MongoDB connection error:', error);
    // In production, we might want to continue even if DB fails if the app can handle it,
    // but usually Express apps need DB. We'll log it clearly.
  }
};
