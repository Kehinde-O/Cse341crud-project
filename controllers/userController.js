const { ObjectId } = require('mongodb');
const { initModel } = require('../models/user');
const bcrypt = require('bcryptjs');

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const User = await initModel();
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// Get a single user by ID
const getUserById = async (req, res, next) => {
  try {
    const User = await initModel();
    const user = await User.findById(req.params.id, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Create a new user
const createUser = async (req, res, next) => {
  try {
    const User = await initModel();
    const newUser = new User(req.body);
    const result = await newUser.save();
    
    // Remove password from response
    const userResponse = result.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (err) {
    next(err);
  }
};

// Update a user
const updateUser = async (req, res, next) => {
  try {
    const User = await initModel();
    
    // Check if user is trying to update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own profile.' 
      });
    }
    
    const updates = { ...req.body };
    
    // Handle password update separately to ensure it's hashed
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Delete a user
const deleteUser = async (req, res, next) => {
  try {
    const User = await initModel();
    
    // Check if user is trying to delete their own account
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own account.' 
      });
    }
    
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 