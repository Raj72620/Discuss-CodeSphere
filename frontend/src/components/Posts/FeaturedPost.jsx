// frontend/src/components/Posts/FeaturedPost.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, Award } from 'lucide-react';

const FeaturedPost = ({ post }) => {
  if (!post) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-xl text-white mb-8">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Award size={20} />
          <span className="font-semibold text-blue-100 text-sm">Featured Discussion</span>
        </div>
        
        <Link to={`/discussion/${post._id}`}>
          <h2 className="text-xl font-bold mb-3 hover:text-blue-100 transition-colors">
            {post.title}
          </h2>
        </Link>

        <div 
          className="text-blue-100 mb-4 line-clamp-2 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3 text-blue-100 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="font-semibold text-xs">
                  {post.author?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{post.author?.username}</span>
            </div>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-4 text-blue-100 text-sm">
            <div className="flex items-center space-x-1">
              <Heart size={14} />
              <span className="font-medium">{post.voteCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare size={14} />
              <span>{post.commentCount}</span>
            </div>
          </div>
        </div>

        <Link 
          to={`/discussion/${post._id}`}
          className="inline-block mt-4 bg-white text-blue-600 px-4 py-1.5 rounded text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          Join Discussion
        </Link>
      </div>
    </div>
  );
};

export default FeaturedPost;