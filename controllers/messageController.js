const { ObjectId } = require('mongodb');
const { initModel } = require('../models/message');
const { initModel: initUserModel } = require('../models/user');

// Get all messages (with pagination)
const getAllMessages = async (req, res, next) => {
  try {
    const Message = await initModel();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName');
    
    const total = await Message.countDocuments({ isDeleted: false });
    
    res.status(200).json({
      messages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get messages between two users
const getMessagesBetweenUsers = async (req, res, next) => {
  try {
    const Message = await initModel();
    const { userId, otherUserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Validate IDs
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const messages = await Message.find({
      isDeleted: false,
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName');
    
    const total = await Message.countDocuments({
      isDeleted: false,
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    });
    
    res.status(200).json({
      messages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get a single message by ID
const getMessageById = async (req, res, next) => {
  try {
    const Message = await initModel();
    const message = await Message.findOne({ 
      _id: req.params.id,
      isDeleted: false
    })
      .populate('sender', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
};

// Create a new message
const createMessage = async (req, res, next) => {
  try {
    const Message = await initModel();
    const newMessage = new Message(req.body);
    const result = await newMessage.save();
    
    // Populate sender and recipient info
    const message = await Message.findById(result._id)
      .populate('sender', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName');
    
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

// Update a message
const updateMessage = async (req, res, next) => {
  try {
    const Message = await initModel();
    // Only allow updating certain fields
    const allowedUpdates = ['content', 'isRead', 'readAt', 'status'];
    const updates = Object.keys(req.body);
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }
    
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('sender', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName');
    
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json(updatedMessage);
  } catch (err) {
    next(err);
  }
};

// Delete a message (soft delete)
const deleteMessage = async (req, res, next) => {
  try {
    const Message = await initModel();
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Permanently delete a message (for admin purposes)
const permanentlyDeleteMessage = async (req, res, next) => {
  try {
    const Message = await initModel();
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json({ message: 'Message permanently deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMessages,
  getMessagesBetweenUsers,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  permanentlyDeleteMessage
}; 