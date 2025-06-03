const mongoose = require('mongoose');
const { connectDB } = require('../config/db.config');

let Message;

// Initialize the Message model with the proper connection
const initModel = async () => {
  if (!Message) {
    const { messageConn } = await connectDB();
    
    const messageSchema = new mongoose.Schema({
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
      },
      attachments: [{
        type: String,
        default: []
      }],
      createdAt: {
        type: Date,
        default: Date.now
      },
      isRead: {
        type: Boolean,
        default: false
      },
      readAt: {
        type: Date,
        default: null
      },
      status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
      },
      isDeleted: {
        type: Boolean,
        default: false
      },
      deletedAt: {
        type: Date,
        default: null
      }
    });

    // Create indexes for faster querying
    messageSchema.index({ sender: 1, recipient: 1 });
    messageSchema.index({ createdAt: -1 });

    // Explicitly set the collection name to 'messages'
    Message = messageConn.model('Message', messageSchema, 'messages');
  }
  
  return Message;
};

module.exports = { initModel }; 