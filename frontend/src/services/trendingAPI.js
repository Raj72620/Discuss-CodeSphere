// frontend/src/services/trendingAPI.js

import API from './api';

export const trendingAPI = {
  // Get trending data (tags, contributors, posts)
  getTrendingData: async () => {
    const response = await API.get('/api/search/trending');
    return response.data;
  },

  // Get top contributors
  getTopContributors: async () => {
    const response = await API.get('/api/search/trending');
    return response.data.topContributors || [];
  },

  // Get trending tags
  getTrendingTags: async () => {
    const response = await API.get('/api/search/trending');
    return response.data.trendingTags || [];
  }
};