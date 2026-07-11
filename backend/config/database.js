import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables (useful if this file is run independently or before server.js)
dotenv.config();

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 */
export const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB URI provided in environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI, { family: 4 });

    // On success, log the host to confirm which cluster we're connected to
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    // On error, log the error message
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the Node.js process with a failure code (1) to prevent the app from running without a DB
    process.exit(1);
  }
};
