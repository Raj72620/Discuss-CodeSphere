// frontend/src/pages/SavedPostsPage.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bookmark } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import PostList from '../components/Posts/PostList';
import { postsAPI } from '../services/postsAPI';
import { toast } from 'react-hot-toast';

const SavedPostsPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedPosts();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSavedPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsAPI.getSavedPosts();
      setSavedPosts(response.savedPosts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load saved posts');
      toast.error('Failed to load saved posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUpdate = (postId, isSaved) => {
    // Remove from saved posts if unsaved
    if (!isSaved) {
      setSavedPosts(prev => prev.filter(post => post._id !== postId));
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-red-500 text-lg mb-2">Please login to view saved posts</div>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be logged in to access your saved posts.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Bookmark className="text-yellow-500" size={32} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Saved Posts
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Your collection of saved discussions and posts.
          </p>
        </div>

        {/* Saved Posts List */}
        <PostList
          posts={savedPosts}
          isLoading={isLoading}
          error={error}
          showSaveButton={true}
          onSaveUpdate={handleSaveUpdate}
          emptyMessage={{
            title: "No saved posts yet",
            description: "Save posts you want to read later by clicking the bookmark icon on any discussion.",
            icon: "🔖"
          }}
        />
      </div>
    </Layout>
  );
};

export default SavedPostsPage;