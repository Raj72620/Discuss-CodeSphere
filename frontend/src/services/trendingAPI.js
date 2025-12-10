// frontend/src/services/trendingAPI.js

import API from './api';

export const trendingAPI = {
  // Get trending data (tags, contributors, posts)
  getTrendingData: async () => {
    try {
      const response = await API.get('/api/search/trending');
      return response.data;
    } catch (error) {
      console.warn('Trending data fetch failed:', error.message);
      return null; // Return null to allow UI to show empty state/skeleton gracefully
    }
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