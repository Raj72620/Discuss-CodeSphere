// frontend/src/services/postsAPI.js

import API from './api';

export const postsAPI = {
  // Get all posts with pagination and filters
  getPosts: async (params = {}) => {
    const response = await API.get('/api/posts', { params });
    return response.data;
  },

  // Get single post by ID
  getPostById: async (id) => {
    const response = await API.get(`/api/posts/${id}`);
    return response.data;
  },

  // Create new post
  createPost: async (postData) => {
    const response = await API.post('/api/posts', postData);
    return response.data;
  },

  updatePost: async (postId, postData) => {
    const response = await API.put(`/api/posts/${postId}`, postData);
    return response.data;
  },
  
  // Add image upload function if needed
  uploadImages: async (formData) => {
    const response = await API.post('/api/upload/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete post
  deletePost: async (id) => {
    const response = await API.delete(`/api/posts/${id}`);
    return response.data;
  },

  // Like/Unlike post
  likePost: async (id) => {
    const response = await API.post(`/api/posts/${id}/like`);
    return response.data;
  },

  // Save/Unsave post
  toggleSavePost: async (id) => {
    const response = await API.post(`/api/posts/${id}/save`);
    return response.data;
  },

  // Get saved posts
  getSavedPosts: async () => {
    const response = await API.get('/api/posts/saved');
    return response.data;
  }
};