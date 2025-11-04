// backend/models/Conversation.js - REPLACE ENTIRE FILE

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

// REMOVE the unique index - it's causing the 500 error
conversationSchema.index({ participants: 1 });

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant._id.toString() === userId.toString()
  );
};

// Static method to find conversation by participants
conversationSchema.statics.findByParticipants = async function(userId1, userId2) {
  try {
    const participantIds = [userId1, userId2]
      .map(id => new mongoose.Types.ObjectId(id))
      .sort();

    return await this.findOne({
      participants: { 
        $all: participantIds,
        $size: 2 
      },
      isActive: true
    });
  } catch (error) {
    console.error('findByParticipants error:', error);
    throw error;
  }
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function(userId1, userId2) {
  try {
    const participantIds = [userId1, userId2]
      .map(id => new mongoose.Types.ObjectId(id))
      .sort();

    // Try to find existing conversation
    let conversation = await this.findOne({
      participants: { 
        $all: participantIds,
        $size: 2 
      },
      isActive: true
    });

    if (!conversation) {
      // Create new conversation
      conversation = new this({
        participants: participantIds
      });
      await conversation.save();
    }

    return conversation;
  } catch (error) {
    console.error('findOrCreate error:', error);
    throw error;
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);