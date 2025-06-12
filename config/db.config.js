const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Mock database for development when MongoDB is not available
const createMockConnection = () => {
  console.log('⚠️  Running in MOCK DATABASE mode - data will not persist');
  console.log('📋 To use real MongoDB, please set up MongoDB and set MONGODB_URI environment variable');
  
  const mockConnection = {
    connection: { host: 'mock-database' },
    model: (name, schema, collection) => {
      // Create a mock model that simulates Mongoose behavior
      const MockModel = function(data) {
        Object.assign(this, data);
        this._id = this._id || new mongoose.Types.ObjectId();
        
        // Initialize arrays that might be needed
        this.refreshTokens = this.refreshTokens || [];
        this.contacts = this.contacts || [];
        this.attachments = this.attachments || [];
        
        this.save = async () => {
          console.log(`📝 Mock save: ${name}`, this);
          return this;
        };
        this.toObject = () => ({ ...this });
      };
      
      MockModel.find = async (query = {}, projection = {}) => {
        console.log(`🔍 Mock find: ${name}`, query);
        return [];
      };
      
      MockModel.findById = async (id, projection = {}) => {
        console.log(`🔍 Mock findById: ${name}`, id);
        return null;
      };
      
      MockModel.findOne = async (query = {}) => {
        console.log(`🔍 Mock findOne: ${name}`, query);
        return null;
      };
      
      MockModel.findByIdAndUpdate = async (id, update, options = {}) => {
        console.log(`📝 Mock findByIdAndUpdate: ${name}`, id, update);
        return null;
      };
      
      MockModel.findOneAndUpdate = async (query, update, options = {}) => {
        console.log(`📝 Mock findOneAndUpdate: ${name}`, query, update);
        return null;
      };
      
      MockModel.findByIdAndDelete = async (id) => {
        console.log(`🗑️  Mock findByIdAndDelete: ${name}`, id);
        return null;
      };
      
      MockModel.countDocuments = async (query = {}) => {
        console.log(`🔢 Mock countDocuments: ${name}`, query);
        return 0;
      };
      
      return MockModel;
    }
  };
  
  return mockConnection;
};

// Create a single connection but use separate collection names
const connectDB = async () => {
  try {
    // Try different MongoDB URI options
    const mongoURI = process.env.MONGODB_URI || 
                     process.env.USER_DB_CONNECTION_STRING || 
                     'mongodb://localhost:27017/messaging';
    
    console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
    
    // Connect to the MongoDB instance with better options
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // We'll use the same connection but with different collection names
    // This is configured at the model level by specifying collection names
    return { 
      // Both connections point to the same database but will use different collections
      userConn: conn, 
      messageConn: conn
    };
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // Check if we should use mock mode for development
    if (process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_DB !== 'false') {
      console.log(`
🔄 Falling back to MOCK DATABASE mode for development...
    `);
      const mockConn = createMockConnection();
      return {
        userConn: mockConn,
        messageConn: mockConn
      };
    }
    
    console.log(`
📋 MongoDB Connection Help:
   
   Option 1 - Install MongoDB locally:
   • Install MongoDB: https://docs.mongodb.com/manual/installation/
   • Start MongoDB: mongod --dbpath /path/to/your/data/directory
   
   Option 2 - Use MongoDB Atlas (Cloud):
   • Sign up at https://cloud.mongodb.com/
   • Create a cluster and get connection string
   • Set MONGODB_URI environment variable
   
   Option 3 - Use Docker:
   • docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   Option 4 - Use Mock Mode (for testing):
   • Set NODE_ENV=development (current mode will use mock database)
   
   For now, the server will exit. Please set up MongoDB and try again.
    `);
    process.exit(1);
  }
};

module.exports = {
  connectDB
}; 