// frontend/src/pages/DiscussionsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Plus, Search, Tag } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import PostList from '../components/Posts/PostList';
import { postsAPI } from '../services/postsAPI';
import { useSelector } from 'react-redux';

const DiscussionsPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    tag: '',
    search: '',
    page: 1,
    limit: 15
  });
  const [pagination, setPagination] = useState({});
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const data = await postsAPI.getPosts(filters);
        setPosts(data.posts || []);
        setPagination(data.pagination || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load discussions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            All Discussions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Browse through community discussions and coding questions
          </p>
        </div>
        
        {isAuthenticated && (
          <Link
            to="/create-post"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm mt-4 sm:mt-0"
          >
            <Plus size={16} />
            <span>New Discussion</span>
          </Link>
        )}
      </div>

      {/* Compact Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                placeholder="Search discussions..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Tag Filter */}
          <div className="flex-1">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={filters.tag}
                onChange={(e) => handleFilterChange({ tag: e.target.value })}
                placeholder="Filter by tag..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.search || filters.tag) && (
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange({ search: '' })}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.tag && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                Tag: #{filters.tag}
                <button
                  onClick={() => handleFilterChange({ tag: '' })}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Posts List */}
      <PostList posts={posts} isLoading={isLoading} error={error} />

      {/* Load More Button */}
      {pagination.hasNext && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Loading...' : 'Load More Discussions'}
          </button>
        </div>
      )}
    </Layout>
  );
};

export default DiscussionsPage;