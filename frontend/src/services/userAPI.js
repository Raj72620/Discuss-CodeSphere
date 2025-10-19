// frontend/src/services/userAPI.js

import API from './api';

export const userAPI = {
  // Get user profile
  getUserProfile: async (username) => {
    const response = await API.get(`/api/profile/${username}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    const response = await API.put('/api/profile', profileData);
    return response.data;
  },

  // Get user posts or saved posts
  getUserContent: async (username, type = 'posts', page = 1, limit = 10) => {
    const response = await API.get(`/api/profile/${username}/${type}`, {
      params: { page, limit }
    });
    return response.data;
  }
};