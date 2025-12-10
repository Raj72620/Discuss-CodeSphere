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
  },
  // Unique key to prevent duplicates: "userId1_userId2" (sorted)
  conversationKey: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate conversationKey
conversationSchema.pre('save', function (next) {
  if (this.participants && (this.isModified('participants') || !this.conversationKey)) {
    const sortedIds = this.participants
      .map(id => id.toString())
      .sort();
    this.conversationKey = sortedIds.join('_');
  }
  next();
});

// Method to check if user is participant
conversationSchema.methods.isParticipant = function (userId) {
  return this.participants.some(participant =>
    participant._id.toString() === userId.toString()
  );
};

// Static method to find conversation by participants - SIMPLIFIED VERSION
conversationSchema.statics.findByParticipants = async function (userId1, userId2) {
  try {
    // Create sorted array of participant IDs for consistent lookup
    const sortedParticipants = [userId1, userId2]
      .map(id => new mongoose.Types.ObjectId(id))
      .sort((a, b) => a.toString().localeCompare(b.toString()));

    console.log('Searching for conversation with participants:', sortedParticipants);

    const conversation = await this.findOne({
      participants: { $all: sortedParticipants, $size: 2 }
    });

    return conversation;
  } catch (error) {
    console.error('findByParticipants error:', error);
    throw error;
  }
};

// Static method to find or create conversation - ULTRA ROBUST VERSION
conversationSchema.statics.findOrCreate = async function (userId1, userId2) {
  try {
    // Convert to ObjectIds and sort for consistency
    const participant1 = new mongoose.Types.ObjectId(userId1);
    const participant2 = new mongoose.Types.ObjectId(userId2);
    const sortedParticipants = [participant1, participant2].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    console.log('Attempting to find or create conversation with participants:', sortedParticipants);

    // First, try to find existing conversation
    let conversation = await this.findOne({
      participants: { $all: sortedParticipants, $size: 2 }
    });

    if (conversation) {
      console.log('✅ Found existing conversation:', conversation._id);
      return conversation;
    }

    // If not found, create new conversation
    console.log('🆕 Creating new conversation...');

    // Generate key manually to be safe
    const conversationKey = sortedParticipants.map(id => id.toString()).join('_');

    conversation = new this({
      participants: sortedParticipants,
      conversationKey: conversationKey
    });

    try {
      await conversation.save();
      console.log('✅ New conversation created:', conversation._id);
      return conversation;
    } catch (saveError) {
      // If duplicate key error, it means another request created it concurrently
      if (saveError.code === 11000) {
        console.log('🔄 Duplicate key detected, finding existing conversation...');
        const existingConversation = await this.findOne({
          participants: { $all: sortedParticipants, $size: 2 }
        });

        if (existingConversation) {
          console.log('✅ Found existing conversation after duplicate error:', existingConversation._id);
          return existingConversation;
        }
      }
      throw saveError;
    }

  } catch (error) {
    console.error('❌ Error in findOrCreate:', error);
    throw error;
  }
};

// Alternative method for emergency recovery
conversationSchema.statics.forceFindByParticipants = async function (userId1, userId2) {
  try {
    const conversations = await this.find({
      participants: { $all: [userId1, userId2] }
    });

    console.log(`Found ${conversations.length} conversations with these participants`);

    // Return the first active one, or the first one if no active found
    const activeConversation = conversations.find(conv => conv.isActive) || conversations[0];
    return activeConversation;
  } catch (error) {
    console.error('forceFindByParticipants error:', error);
    return null;
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);