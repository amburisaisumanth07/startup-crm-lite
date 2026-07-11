import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing raw Mongoose connection...');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log(`Success! Connected to: ${conn.connection.host}`);
    process.exit(0);
  } catch (err) {
    console.error('Mongoose connection failed:', err);
    process.exit(1);
  }
}

test();
