const jwt = require('jsonwebtoken');
const { initModel } = require('../models/user');

// Middleware to verify JWT token or session (prioritizes session for browsers)
const authenticateToken = async (req, res, next) => {
  try {
    // PRIORITY 1: Check if user is authenticated via session (for browser/OAuth users)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      // User is authenticated via session (GitHub OAuth or other session-based auth)
      console.log('🌐 Browser authentication via session:', req.user.username);
      
      // Update last active time for session users
      try {
        const User = await initModel();
        await User.findByIdAndUpdate(req.user._id, {
          lastActive: new Date()
        });
      } catch (updateErr) {
        console.warn('⚠️ Could not update last active time:', updateErr.message);
      }
      
      return next();
    }

    // PRIORITY 2: Check for JWT token (for API clients like Postman)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'Please login via GitHub OAuth (browser) or provide Bearer token (API clients)',
        authMethods: {
          browser: 'Navigate to /api/auth/github for OAuth login',
          apiClient: 'Include "Authorization: Bearer YOUR_TOKEN" header'
        }
      });
    }

    // Verify JWT token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'JWT authentication not configured',
        error: 'JWT_SECRET environment variable not set. Use session-based authentication instead.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details
    const User = await initModel();
    const user = await User.findByIdAndUpdate(
      decoded.userId, 
      { lastActive: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'User not found or token is for deleted user'
      });
    }

    // Add user to request object
    req.user = user;
    console.log('🔑 API client authentication via JWT:', user.username);
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Invalid token',
        error: 'Token verification failed. Please login again.',
        suggestion: 'Use /api/auth/refresh to get a new token or login via browser'
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: 'Token expired',
        error: 'Access token has expired. Use refresh token to get a new one.',
        suggestion: 'POST to /api/auth/refresh with your refresh token'
      });
    }
    
    console.error('❌ Authentication error:', err);
    return res.status(500).json({ 
      message: 'Authentication error',
      error: err.message
    });
  }
};

// Middleware for optional authentication (doesn't fail if no token or session)
const optionalAuth = async (req, res, next) => {
  try {
    // PRIORITY 1: Check if user is authenticated via session (browser users)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      console.log('🌐 Optional auth: User found in session:', req.user.username);
      
      // Update last active time for session users
      try {
        const User = await initModel();
        await User.findByIdAndUpdate(req.user._id, {
          lastActive: new Date()
        });
      } catch (updateErr) {
        console.warn('⚠️ Could not update last active time:', updateErr.message);
      }
      
      return next();
    }

    // PRIORITY 2: Check for JWT token (API clients)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = await initModel();
        const user = await User.findByIdAndUpdate(
          decoded.userId,
          { lastActive: new Date() },
          { new: true }
        ).select('-password');
        
        if (user) {
          req.user = user;
          console.log('🔑 Optional auth: User found via JWT:', user.username);
        }
      } catch (tokenErr) {
        // Token invalid, continue without auth
        console.log('📝 Optional auth: Invalid token, continuing without authentication');
      }
    }
    
    next();
  } catch (err) {
    // Continue without authentication if any error occurs
    console.log('📝 Optional auth: Error occurred, continuing without authentication');
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