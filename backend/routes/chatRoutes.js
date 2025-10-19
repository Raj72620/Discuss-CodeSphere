// backend/routes/chatRoutes.js

const express = require('express');
const {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  sharePost,
  editMessage,           
  deleteMessage,
  getUnreadCounts,       
  markMessagesAsRead     
} = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Existing routes
router.post('/conversations', auth, getOrCreateConversation);
router.get('/conversations', auth, getUserConversations);
router.get('/conversations/:conversationId/messages', auth, getConversationMessages);
router.post('/messages', auth, sendMessage);
router.post('/share-post', auth, sharePost);

// NEW ROUTES
router.put('/messages/:messageId', auth, editMessage);
router.delete('/messages/:messageId', auth, deleteMessage);
router.get('/unread-counts', auth, getUnreadCounts);
router.put('/conversations/:conversationId/read', auth, markMessagesAsRead);

module.exports = router;