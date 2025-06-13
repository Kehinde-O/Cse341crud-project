const bcrypt = require('bcryptjs');
const passport = require('passport');
const { initModel } = require('../models/user');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Register new user
const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, profilePicture, bio } = req.body;
    
    const User = await initModel();
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        error: existingUser.email === email.toLowerCase() ? 'Email already registered' : 'Username already taken'
      });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      profilePicture: profilePicture || '',
      bio: bio || '',
      authProvider: 'local'
    });
    
    await newUser.save();
    
    // Generate tokens
    const accessToken = generateToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);
    
    // Save refresh token to user document
    newUser.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await newUser.save();
    
    // Return user data without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (err) {
    next(err);
  }
};

// Login user
const login = async (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({
          message: 'Authentication failed',
          error: info.message
        });
      }
      
      // Generate tokens
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      
      // Save refresh token to user document
      const User = await initModel();
      await User.findByIdAndUpdate(user._id, {
        $push: {
          refreshTokens: {
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        },
        lastActive: new Date()
      });
      
      // Return user data without password
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.refreshTokens;
      
      res.status(200).json({
        message: 'Login successful',
        user: userResponse,
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    
    if (refreshToken) {
      const User = await initModel();
      
      // Remove the specific refresh token
      await User.findByIdAndUpdate(req.user._id, {
        $pull: {
          refreshTokens: { token: refreshToken }
        }
      });
    }
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
};

// Logout from all devices
const logoutAll = async (req, res, next) => {
  try {
    const User = await initModel();
    
    // Remove all refresh tokens
    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshTokens: [] }
    });
    
    res.status(200).json({ message: 'Logged out from all devices' });
  } catch (err) {
    next(err);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Invalid token type' });
    }
    
    const User = await initModel();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(token => token.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const newAccessToken = generateToken(user._id);
    
    res.status(200).json({
      accessToken: newAccessToken
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
    next(err);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const userResponse = req.user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: userResponse
    });
  } catch (err) {
    next(err);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'profilePicture'];
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }
    
    const User = await initModel();
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password -refreshTokens' }
    );
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// OAuth success callback (works for GitHub, Google, etc.)
const oauthCallback = async (req, res, next) => {
  try {
    // Update user's last active time
    const User = await initModel();
    await User.findByIdAndUpdate(req.user._id, {
      lastActive: new Date()
    });
    
    // Generate tokens for OAuth user (optional - user can use session instead)
    const accessToken = generateToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);
    
    // Save refresh token
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        refreshTokens: {
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    console.log('✅ OAuth login successful for user:', req.user.username);
    
    // Return success response with user info and optional tokens
    // User is now authenticated via session and can use protected routes
    res.status(200).json({
      message: 'OAuth login successful',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        authProvider: req.user.authProvider
      },
      sessionActive: true,
      // Optional tokens for API access
      accessToken,
      refreshToken
    });
  } catch (err) {
    next(err);
  }
};

// Keep the old name for backward compatibility
const googleCallback = oauthCallback;

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getProfile,
  updateProfile,
  oauthCallback,
  googleCallback // Keep for backward compatibility
}; 