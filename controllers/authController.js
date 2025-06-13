const bcrypt = require('bcryptjs');
const passport = require('passport');
const { initModel } = require('../models/user');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// OAuth success callback (works for GitHub OAuth)
const oauthCallback = async (req, res, next) => {
  console.log('🔥 OAuth Callback - Starting process');
  
  try {
    if (!req.user) {
      console.error('❌ No user found in OAuth callback');
      return res.redirect('/?error=oauth_failed');
    }

    console.log('✅ OAuth successful for user:', req.user.username);
    console.log('🔍 Session ID:', req.sessionID);
    console.log('🔍 Session before storing user:', JSON.stringify(req.session, null, 2));
    
    // Store user in session for browser-based authentication
    req.session.user = req.user;
    
    // Force session save to ensure it's persisted
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.redirect('/?error=session_save_failed');
      }
      
      console.log('💾 User stored in session successfully');
      console.log('🔍 Session after storing user:', JSON.stringify(req.session, null, 2));
      console.log('🔍 Cookie settings:', req.session.cookie);
      console.log('🏠 Redirecting to home');
      
      res.redirect('/');
    });
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    res.redirect('/?error=oauth_error');
  }
};

// Logout user (both session and JWT)
const logout = async (req, res, next) => {
  try {
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });
    
    // Clear cookie
    res.clearCookie('connect.sid');
    
    // Log out from passport
    req.logout((err) => {
      if (err) {
        console.error('Passport logout error:', err);
      }
    });
    
    res.redirect('/');
  } catch (err) {
    console.error('Logout error:', err);
    next(err);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
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

// Check authentication status
const getAuthStatus = async (req, res, next) => {
  try {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const userResponse = req.user.toObject();
      delete userResponse.password;
      delete userResponse.refreshTokens;
      
      res.status(200).json({
        isAuthenticated: true,
        user: userResponse
      });
    } else {
      res.status(200).json({
        isAuthenticated: false,
        user: null
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  oauthCallback,
  logout,
  getProfile,
  getAuthStatus
}; 