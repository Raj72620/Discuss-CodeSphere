// backend/controllers/chatController.js


const mongoose = require('mongoose'); 
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get or create conversation
// @route   POST /api/chat/conversations
// @access  Private

const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

    console.log('=== CHAT DEBUG START ===');
    console.log('User ID:', userId);
    console.log('Participant ID:', participantId);

    // Enhanced validation
    if (!participantId || !mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ 
        message: 'Valid participant ID is required',
        error: 'INVALID_PARTICIPANT_ID'
      });
    }

    if (userId.toString() === participantId) {
      return res.status(400).json({ 
        message: 'Cannot start conversation with yourself',
        error: 'SELF_CONVERSATION'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'PARTICIPANT_NOT_FOUND'
      });
    }

    // SIMPLIFIED: Use findOrCreate without transaction
    const conversation = await Conversation.findOrCreate(userId, participantId);
    
    await conversation.populate('participants', 'username avatarUrl isOnline lastSeen');

    console.log('=== CHAT DEBUG END - SUCCESS ===');
    console.log('Conversation ID:', conversation._id);
    
    res.json({ 
      conversation,
      message: 'Conversation ready'
    });

  } catch (error) {
    console.log('=== CHAT DEBUG END - ERROR ===');
    console.error('Get or create conversation error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific errors
    if (error.code === 11000) {
      // If still getting duplicate error, try to find existing conversation
      try {
        const conversation = await Conversation.findByParticipants(req.user._id, req.body.participantId);
        if (conversation) {
          await conversation.populate('participants', 'username avatarUrl isOnline lastSeen');
          return res.json({ conversation });
        }
      } catch (findError) {
        console.error('Error finding existing conversation:', findError);
      }
    }
    
    res.status(500).json({ 
      message: 'Server error while creating conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};



// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Private
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'username avatarUrl isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      match: { isDeleted: false }
    })
    .sort({ lastMessageAt: -1 })
    .lean();

    res.json({ conversations });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/conversations/:conversationId/messages
// @access  Private
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation || !conversation.isParticipant(req.user._id)) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ 
      conversation: conversationId,
      isDeleted: false // Exclude deleted messages
    })
      .populate('sender', 'username avatarUrl')
      .populate('sharedPost', 'title content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false
      },
      { 
        $set: { isRead: true },
        $addToSet: { readBy: req.user._id }
      }
    );

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: page,
        hasNext: messages.length === limit
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text', sharedPostId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation || !conversation.isParticipant(userId)) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    let sharedPost = null;
    if (messageType === 'post_share' && sharedPostId) {
      sharedPost = await Post.findById(sharedPostId);
      if (!sharedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
    }

    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content,
      messageType,
      sharedPost: sharedPostId
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate message for response
    await message.populate('sender', 'username avatarUrl');
    if (sharedPost) {
      await message.populate('sharedPost', 'title content');
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversationId}`).emit('new-message', {
        ...message.toObject(),
        participants: conversation.participants
      });
    }

    res.status(201).json({ message });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};


// @desc    Share a post in chat
// @route   POST /api/chat/share-post
// @access  Private
const sharePost = async (req, res) => {
  try {
    const { conversationId, postId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    const post = await Post.findById(postId);

    if (!conversation || !conversation.isParticipant(userId)) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: `Shared a post: ${post.title}`,
      messageType: 'post_share',
      sharedPost: postId
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    await message.populate('sender', 'username avatarUrl');
    await message.populate('sharedPost', 'title content');

    res.status(201).json({ message });

  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Server error while sharing post' });
  }
};

// @desc    Edit a message
// @route   PUT /api/chat/messages/:messageId
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Check if message is deleted
    if (message.isDeleted) {
      return res.status(400).json({ message: 'Cannot edit a deleted message' });
    }

    // Update message
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    
    await message.save();

    // Populate sender info for response
    await message.populate('sender', 'username avatarUrl');

    res.json({ 
      message: 'Message updated successfully', 
      updatedMessage: message 
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ 
      message: 'Server error while editing message',
      error: error.message 
    });
  }
};

// @desc    Delete a message (soft delete)
// @route   DELETE /api/chat/messages/:messageId
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Soft delete the message
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted'; // Override content
    
    await message.save();

    res.json({ 
      message: 'Message deleted successfully',
      deletedMessage: message
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting message',
      error: error.message 
    });
  }
};

// @desc    Get unread message counts for all conversations
// @route   GET /api/chat/unread-counts
const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    });

    const conversationIds = conversations.map(conv => conv._id);

    // Count unread messages for each conversation
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          sender: { $ne: userId }, // Messages from others
          isRead: false,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$sender',
          unreadCount: { $sum: 1 },
          lastMessageAt: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $unwind: '$sender'
      },
      {
        $project: {
          _id: 1,
          unreadCount: 1,
          lastMessageAt: 1,
          'sender.username': 1,
          'sender.avatarUrl': 1
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      }
    ]);

    // Convert to a more usable format
    const countsMap = {};
    unreadCounts.forEach(item => {
      countsMap[item._id] = {
        count: item.unreadCount,
        lastMessageAt: item.lastMessageAt,
        sender: item.sender
      };
    });

    res.json({ 
      unreadCounts: countsMap 
    });

  } catch (error) {
    console.error('Get unread counts error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching unread counts',
      error: error.message 
    });
  }
};

// @desc    Mark messages as read in a conversation
// @route   PUT /api/chat/conversations/:conversationId/read
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark all unread messages from others as read
    const result = await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        isRead: false
      },
      {
        $set: { isRead: true },
        $addToSet: { readBy: userId }
      }
    );

    // Update unread counts after marking as read
    const unreadCounts = await getUnreadCountsForUser(userId);

    res.json({
      message: 'Messages marked as read',
      updatedCount: result.modifiedCount,
      unreadCounts
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ 
      message: 'Server error while marking messages as read',
      error: error.message 
    });
  }
};

// Helper function to get unread counts for a user
const getUnreadCountsForUser = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
    isActive: true
  });

  const conversationIds = conversations.map(conv => conv._id);

  const unreadCounts = await Message.aggregate([
    {
      $match: {
        conversation: { $in: conversationIds },
        sender: { $ne: userId },
        isRead: false,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$sender',
        unreadCount: { $sum: 1 }
      }
    }
  ]);

  const countsMap = {};
  unreadCounts.forEach(item => {
    countsMap[item._id] = item.unreadCount;
  });

  return countsMap;
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  sharePost,
  editMessage,
  deleteMessage,
  getUnreadCounts,
  markMessagesAsRead
};