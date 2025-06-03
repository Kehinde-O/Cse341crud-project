const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Create separate connections for users and messages
const connectDB = async () => {
  try {
    // Extract the base MongoDB URI without the database name
    const mongoURI = process.env.MONGODB_URI;
    let baseURI = mongoURI;
    
    // If the URI includes a database name, remove it to create our base connection string
    if (mongoURI.includes('?')) {
      const uriParts = mongoURI.split('?');
      const hostPart = uriParts[0].split('/').slice(0, -1).join('/');
      baseURI = `${hostPart}?${uriParts[1]}`;
    } else if (mongoURI.split('/').length > 3) {
      baseURI = mongoURI.split('/').slice(0, -1).join('/');
    }
    
    // Connect to the default database (for users)
    const userDbURI = `${baseURI}/usersDb`;
    const userConn = mongoose.createConnection(userDbURI);
    
    // Connect to a separate database for messages
    const messageDbURI = `${baseURI}/messagesDb`;
    const messageConn = mongoose.createConnection(messageDbURI);
    
    console.log(`MongoDB User Database Connected: ${userConn.host}`);
    console.log(`MongoDB Message Database Connected: ${messageConn.host}`);
    
    return { userConn, messageConn };
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB
}; 