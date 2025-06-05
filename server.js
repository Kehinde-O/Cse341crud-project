const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const { connectDB } = require('./config/db.config');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 1 day
}));

// Handle OPTIONS preflight requests
app.options('*', cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// API routes
app.use('/api', routes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    validatorUrl: null, // Disable validator
    docExpansion: 'list', // Expand all operations by default
    persistAuthorization: true, // Remember auth values
    tryItOutEnabled: true,
    displayRequestDuration: true,
    filter: true,
    requestInterceptor: (request) => {
      request.headers['X-Requested-With'] = 'XMLHttpRequest';
      return request;
    }
  }
}));

// Add a route to serve the Swagger JSON for Postman import
app.get('/api-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.send(swaggerSpec);
});

// Add a redirect from root to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Error handling middleware
app.use(errorHandler);

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CRUD Project Server is running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
}); 