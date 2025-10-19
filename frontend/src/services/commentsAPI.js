// frontend/src/services/commentsAPI.js

import API from './api';

export const commentsAPI = {
  // Get comments for a post (via post API)
  getComments: async (postId) => {
    const response = await API.get(`/api/posts/${postId}`);
    return response.data;
  },

  // Add a comment to a post
  addComment: async (postId, commentData) => {
    const response = await API.post(`/api/posts/${postId}/comments`, commentData);
    return response.data;
  },

  // Like/unlike a comment
  likeComment: async (commentId) => {
    const response = await API.post(`/api/comments/${commentId}/like`);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await API.delete(`/api/comments/${commentId}`);
    return response.data;
  },

  // Update a comment
  updateComment: async (commentId, commentData) => {
    const response = await API.put(`/api/comments/${commentId}`, commentData);
    return response.data;
  },

  // Mark comment as solution
  markAsSolution: async (commentId) => {
    const response = await API.put(`/api/comments/${commentId}/solution`);
    return response.data;
  }
};