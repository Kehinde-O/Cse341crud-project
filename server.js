const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', // Allow configured origins or all
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 1 day
}));

// Handle OPTIONS preflight requests
app.options('*', cors());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || '',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    // User is logged in
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Status</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            .status { padding: 20px; border-radius: 8px; margin: 20px 0; }
            .logged-in { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .links { margin-top: 30px; }
            .links a { margin: 0 10px; padding: 10px 20px; text-decoration: none; background-color: #007bff; color: white; border-radius: 5px; }
            .links a:hover { background-color: #0056b3; }
          </style>
        </head>
        <body>
          <h1>CRUD Project</h1>
          <div class="status logged-in">
            <h2>✅ Logged in as "${req.user.displayName || req.user.username}"</h2>
          </div>
          <div class="links">
            <a href="/api-docs">API Documentation</a>
            <a href="/api/auth/logout">Logout</a>
            <a href="/api/users">View Users</a>
            <a href="/api/messages">View Messages</a>
          </div>
        </body>
      </html>
    `);
  } else {
    // User is not logged in
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Status</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            .status { padding: 20px; border-radius: 8px; margin: 20px 0; }
            .logged-out { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .links { margin-top: 30px; }
            .links a { margin: 0 10px; padding: 10px 20px; text-decoration: none; background-color: #007bff; color: white; border-radius: 5px; }
            .links a:hover { background-color: #0056b3; }
          </style>
        </head>
        <body>
          <h1>CRUD Project</h1>
          <div class="status logged-out">
            <h2>❌ You are not logged in</h2>
          </div>
          <div class="links">
            <a href="/api/auth/github">Login with GitHub</a>
            <a href="/api-docs">API Documentation</a>
            <a href="/api/users">View Users (Read Only)</a>
            <a href="/api/messages">View Messages (Read Only)</a>
          </div>
        </body>
      </html>
    `);
  }
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