// frontend/src/store/slices/chatSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI } from '../../services/chatAPI';

export const fetchUnreadCounts = createAsyncThunk(
  'chat/fetchUnreadCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getUnreadCounts();
      return response.unreadCounts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread counts');
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  'chat/markConversationAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatAPI.markMessagesAsRead(conversationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark messages as read');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    activeConversation: null,
    activeRecipient: null,
    unreadCounts: {},
    messages: [],
    isChatOpen: false,
    isLoading: false,
    error: null
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload.conversation;
      state.activeRecipient = action.payload.recipient;
      state.isChatOpen = true;
      state.error = null;
    },
    closeChat: (state) => {
      state.isChatOpen = false;
      state.activeConversation = null;
      state.activeRecipient = null;
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg._id === messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
      }
    },
    deleteMessage: (state, action) => {
      const messageId = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg._id === messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = {
          ...state.messages[messageIndex],
          isDeleted: true,
          content: 'This message was deleted',
          deletedAt: new Date().toISOString()
        };
      }
    },
    updateUnreadCounts: (state, action) => {
      state.unreadCounts = action.payload;
    },
    markMessagesAsRead: (state, action) => {
      const conversationId = action.payload;
      // Mark messages as read in the current conversation
      state.messages.forEach(message => {
        if (message.conversation === conversationId && !message.isRead) {
          message.isRead = true;
        }
      });
      
      // Update unread counts for the recipient
      if (state.activeRecipient) {
        state.unreadCounts[state.activeRecipient._id] = 0;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Unread Counts
      .addCase(fetchUnreadCounts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Convert array to map format
        const countsMap = {};
        if (action.payload && typeof action.payload === 'object') {
          Object.keys(action.payload).forEach(userId => {
            countsMap[userId] = action.payload[userId].count || action.payload[userId];
          });
        }
        state.unreadCounts = countsMap;
        state.error = null;
      })
      .addCase(fetchUnreadCounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark Conversation as Read
      .addCase(markConversationAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update unread counts from response
        if (action.payload.unreadCounts) {
          const countsMap = {};
          Object.keys(action.payload.unreadCounts).forEach(userId => {
            countsMap[userId] = action.payload.unreadCounts[userId];
          });
          state.unreadCounts = countsMap;
        }
        state.error = null;
      })
      .addCase(markConversationAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setActiveConversation, 
  closeChat, 
  addMessage, 
  updateMessage,
  deleteMessage,
  updateUnreadCounts,
  markMessagesAsRead,
  setLoading,
  clearError,
  setError
} = chatSlice.actions;
export default chatSlice.reducer;