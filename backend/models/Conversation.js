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
    
    // Convert to ObjectId for proper comparison
    const participantIds = sortedParticipants.map(id => new mongoose.Types.ObjectId(id));
    
    const conversation = await this.findOne({
      participants: { 
        $all: participantIds,
        $size: 2 
      },
      isActive: true
    });
    
    return conversation;
  } catch (error) {
    console.error('findByParticipants error:', error);
    throw error;
  }
};
// Static method to find or create conversation - FIXED VERSION

conversationSchema.statics.findOrCreate = async function(userId1, userId2) {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Sort participants for consistency
      const sortedParticipants = [userId1, userId2]
        .map(id => new mongoose.Types.ObjectId(id))
        .sort();

      // Look for existing conversation
      let conversation = await this.findOne({
        participants: { 
          $all: sortedParticipants,
          $size: 2 
        },
        isActive: true
      }).session(session);

      if (!conversation) {
        // Create new conversation
        conversation = new this({
          participants: sortedParticipants
        });
        await conversation.save({ session });
      }

      await session.commitTransaction();
      return conversation;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('findOrCreate transaction error:', error);
    throw error;
  }
};
module.exports = mongoose.model('Conversation', conversationSchema);