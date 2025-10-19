//frontend/src/services/authAPI.js

import API from './api';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await API.post('/api/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await API.post('/api/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await API.get('/api/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await API.put('/api/profile', profileData);
    return response.data;
  }
};