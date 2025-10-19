// frontend/src/components/Posts/PostList.jsx

import React from 'react';
import PostCard from './PostCard';

const PostList = ({ 
  posts, 
  isLoading, 
  error, 
  showSaveButton = true, 
  onSaveUpdate,
  emptyMessage = {
    title: "No discussions yet",
    description: "Be the first to start a discussion!",
    icon: "📝"
  }
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={`skeleton-${i}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="space-y-1.5 mb-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-sm mb-2">Error loading posts</div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">{emptyMessage.icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {emptyMessage.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {emptyMessage.description}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard 
          key={`post-${post._id}`} 
          post={post} 
          showSaveButton={showSaveButton}
          onSaveUpdate={onSaveUpdate}
        />
      ))}
    </div>
  );
};

export default PostList;