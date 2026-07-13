import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables (useful if this file is run independently or before server.js)
dotenv.config();

/**
 * Establishes a connection to the MongoDB Atlas database using Mongoose.
 *
 * Key options:
 *  - serverSelectionTimeoutMS: fail fast (10s) if Atlas is unreachable instead of hanging.
 *  - socketTimeoutMS: abort a slow operation after 45s.
 *  - family is intentionally NOT set — omitting it lets the driver negotiate IPv4/IPv6
 *    automatically, which is required on Railway's network infrastructure.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,          // Abort slow operations after 45s
    });

    // On success, log the host to confirm which cluster we're connected to
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    // On error, log the error message and exit so Railway restarts the container
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
