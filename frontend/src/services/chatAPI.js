// frontend/src/services/chatAPI.js

import API from './api';

export const chatAPI = {
  // Existing methods
  getOrCreateConversation: async (participantId) => {
    const response = await API.post('/api/chat/conversations', { participantId });
    return response.data;
  },

  getConversationMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await API.get(`/api/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await API.post('/api/chat/messages', messageData);
    return response.data;
  },

  // New methods for edit/delete
  editMessage: async (messageId, content) => {
    const response = await API.put(`/api/chat/messages/${messageId}`, { content });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await API.delete(`/api/chat/messages/${messageId}`);
    return response.data;
  },

  getUnreadCounts: async () => {
    const response = await API.get('/api/chat/unread-counts');
    return response.data;
  },

  markMessagesAsRead: async (conversationId) => {
    const response = await API.put(`/api/chat/conversations/${conversationId}/read`);
    return response.data;
  }
};