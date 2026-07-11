import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing raw MongoDB driver connection...');
  console.log('URI:', 'mongodb://crm-admin:****@ac-zmpnqmu-shard-00-00.ydgvsa1.mongodb.net:27017,ac-zmpnqmu-shard-00-01.ydgvsa1.mongodb.net:27017,ac-zmpnqmu-shard-00-02.ydgvsa1.mongodb.net:27017/startupcrm?ssl=true&authSource=admin&retryWrites=true&w=majority');
  
  const client = new MongoClient('mongodb://crm-admin:msdhoni_07@ac-zmpnqmu-shard-00-00.ydgvsa1.mongodb.net:27017,ac-zmpnqmu-shard-00-01.ydgvsa1.mongodb.net:27017,ac-zmpnqmu-shard-00-02.ydgvsa1.mongodb.net:27017/startupcrm?ssl=true&authSource=admin&retryWrites=true&w=majority', {
    serverSelectionTimeoutMS: 5000,
    family: 4
  });
  
  try {
    await client.connect();
    console.log('Success! Connected to cluster.');
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB driver connection failed:', err);
    process.exit(1);
  }
}

test();
