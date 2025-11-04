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

// Create a compound index that allows multiple conversations but prevents exact duplicates
conversationSchema.index({ participants: 1 }, { 
  unique: true,
  partialFilterExpression: { isActive: true }
});

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant._id.toString() === userId.toString()
  );
};

// Static method to find conversation by participants - IMPROVED VERSION
conversationSchema.statics.findByParticipants = async function(userId1, userId2) {
  try {
    // Create sorted array of participant IDs for consistent lookup
    const sortedParticipants = [userId1, userId2]
      .map(id => id.toString())
      .sort();
    
    const conversation = await this.findOne({
      participants: { $all: sortedParticipants, $size: 2 },
      isActive: true
    });
    
    return conversation;
  } catch (error) {
    console.error('findByParticipants error:', error);
    throw error;
  }
};

// Static method to find or create conversation - ROBUST VERSION
conversationSchema.statics.findOrCreate = async function(userId1, userId2) {
  try {
    // Sort the participant IDs to ensure consistency
    const sortedParticipants = [userId1, userId2]
      .map(id => id.toString())
      .sort();
    
    console.log('Looking for conversation with participants:', sortedParticipants);
    
    // First, try to find existing conversation
    let conversation = await this.findOne({
      participants: { $all: sortedParticipants, $size: 2 },
      isActive: true
    });

    if (!conversation) {
      console.log('No existing conversation found, creating new one...');
      
      // Create new conversation
      conversation = new this({
        participants: sortedParticipants
      });
      
      await conversation.save();
      console.log('New conversation created:', conversation._id);
    } else {
      console.log('Existing conversation found:', conversation._id);
    }

    return conversation;
  } catch (error) {
    console.error('findOrCreate error:', error);
    
    // If it's a duplicate key error, try to find the existing conversation again
    if (error.code === 11000) {
      console.log('Duplicate key error, searching for existing conversation...');
      const existingConversation = await this.findOne({
        participants: { $all: [userId1, userId2], $size: 2 },
        isActive: true
      });
      
      if (existingConversation) {
        console.log('Found existing conversation after duplicate error:', existingConversation._id);
        return existingConversation;
      }
    }
    
    throw error;
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);