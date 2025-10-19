// backend/models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'post_share', 'image'],
    default: 'text'
  },
  sharedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // NEW FIELDS FOR EDIT/DELETE
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ isDeleted: 1 }); // NEW INDEX

module.exports = mongoose.model('Message', messageSchema);