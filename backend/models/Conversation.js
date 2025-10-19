// backend/models/Conversation.js

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Remove the unique index completely and use a sparse index instead
conversationSchema.index({ participants: 1 });

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant._id.toString() === userId.toString()
  );
};

// Static method to find conversation by participants - FIXED VERSION
conversationSchema.statics.findByParticipants = async function(userId1, userId2) {
  try {
    // Sort the participant IDs to ensure consistent lookup
    const sortedParticipants = [userId1, userId2].sort();
    
    const conversation = await this.findOne({
      participants: { $all: sortedParticipants },
      isActive: true
    });
    
    return conversation;
  } catch (error) {
    console.error('findByParticipants error:', error);
    throw error;
  }
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function(userId1, userId2) {
  // Sort the participant IDs to ensure consistency
  const sortedParticipants = [userId1, userId2].sort();
  
  let conversation = await this.findOne({
    participants: { $all: sortedParticipants },
    isActive: true
  });

  if (!conversation) {
    conversation = new this({
      participants: sortedParticipants
    });
    await conversation.save();
  }

  return conversation;
};

module.exports = mongoose.model('Conversation', conversationSchema);