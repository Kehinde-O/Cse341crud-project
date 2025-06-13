const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db.config');

let User;

// Initialize the User model with the proper connection
const initModel = async () => {
  if (!User) {
    const { userConn } = await connectDB();
    
    const userSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3,
        maxlength: 30
      },
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
          if (!validator.isEmail(value)) {
            throw new Error('Email is invalid');
          }
        }
      },
      password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true
      },
      firstName: {
        type: String,
        required: true,
        trim: true
      },
      lastName: {
        type: String,
        required: true,
        trim: true
      },
      profilePicture: {
        type: String,
        default: ''
      },
      bio: {
        type: String,
        default: '',
        maxlength: 200
      },
      // OAuth fields
      googleId: {
        type: String,
        default: null
      },
      githubId: {
        type: String,
        default: null
      },
      authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
      },
      isEmailVerified: {
        type: Boolean,
        default: false
      },
      emailVerificationToken: {
        type: String,
        default: null
      },
      // Session management
      refreshTokens: [{
        token: String,
        createdAt: {
          type: Date,
          default: Date.now
        },
        expiresAt: Date
      }],
      // Timestamps
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      lastActive: {
        type: Date,
        default: Date.now
      },
      contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    });

    // Hash the password before saving and update timestamps
    userSchema.pre('save', async function(next) {
      const user = this;
      
      if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      
      // Update timestamps
      if (!user.isNew) {
        user.updatedAt = new Date();
      }
      
      next();
    });

    // Explicitly set the collection name to 'users'
    User = userConn.model('User', userSchema, 'users');
  }
  
  return User;
};

module.exports = { initModel }; 