const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Create a single connection but use separate collection names
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    // Connect to the MongoDB instance
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // We'll use the same connection but with different collection names
    // This is configured at the model level by specifying collection names
    return { 
      // Both connections point to the same database but will use different collections
      userConn: conn, 
      messageConn: conn
    };
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB
}; 