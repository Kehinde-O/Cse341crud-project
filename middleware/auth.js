const jwt = require('jsonwebtoken');
const { initModel } = require('../models/user');

// Middleware to verify JWT token or session
const authenticateToken = async (req, res, next) => {
  try {
    // First, check if user is authenticated via session (for OAuth users)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      // User is authenticated via session (GitHub OAuth)
      console.log('✅ User authenticated via session:', req.user.username);
      return next();
    }

    // Otherwise, check for JWT token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token or login session required',
        error: 'No token provided and not logged in via OAuth'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details
    const User = await initModel();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    console.log('✅ User authenticated via JWT:', user.username);
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Invalid token',
        error: 'Token verification failed'
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: 'Token expired',
        error: 'Please login again'
      });
    }
    
    return res.status(500).json({ 
      message: 'Authentication error',
      error: err.message
    });
  }
};

// Middleware for optional authentication (doesn't fail if no token or session)
const optionalAuth = async (req, res, next) => {
  try {
    // First, check if user is authenticated via session
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      console.log('📝 Optional auth: User found in session:', req.user.username);
      return next();
    }

    // Otherwise, check for JWT token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = await initModel();
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
        console.log('📝 Optional auth: User found via JWT:', user.username);
      }
    }
    next();
  } catch (err) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set to generate access tokens');
  }
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable must be set to generate refresh tokens');
  }
  return jwt.sign(
    { userId: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  generateRefreshToken
}; 