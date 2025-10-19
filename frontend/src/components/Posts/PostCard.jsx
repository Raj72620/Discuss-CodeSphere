// frontend/src/components/Posts/PostCard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, CheckCircle, Bookmark, Share2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { postsAPI } from '../../services/postsAPI';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, showSaveButton = true, onSaveUpdate }) => {
  const [currentPost, setCurrentPost] = useState(post);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      setIsLiking(true);
      
      // Optimistically update UI
      setCurrentPost(prev => ({
        ...prev,
        likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        isLiked: !prev.isLiked
      }));

      const response = await postsAPI.likePost(currentPost._id);
      
      // Update with actual response
      setCurrentPost(prev => ({
        ...prev,
        likeCount: response.likeCount,
        isLiked: response.isLiked
      }));
      
      toast.success(response.isLiked ? 'Post liked!' : 'Like removed!');
    } catch (err) {
      // Revert optimistic update on error
      setCurrentPost(prev => ({
        ...prev,
        likeCount: prev.isLiked ? prev.likeCount + 1 : prev.likeCount - 1,
        isLiked: !prev.isLiked
      }));
      
      toast.error(err.response?.data?.message || 'Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save posts');
      return;
    }

    try {
      setIsSaving(true);
      
      // Optimistically update UI
      setCurrentPost(prev => ({
        ...prev,
        isSaved: !prev.isSaved
      }));

      const response = await postsAPI.toggleSavePost(currentPost._id);
      
      // Update with actual response
      setCurrentPost(prev => ({
        ...prev,
        isSaved: response.isSaved
      }));

      // Call callback if provided (for updating parent state)
      if (onSaveUpdate) {
        onSaveUpdate(currentPost._id, response.isSaved);
      }
      
      toast.success(response.isSaved ? 'Post saved!' : 'Post unsaved!');
    } catch (err) {
      // Revert optimistic update on error
      setCurrentPost(prev => ({
        ...prev,
        isSaved: !prev.isSaved
      }));
      
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/discussion/${currentPost._id}`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPost.title,
          text: currentPost.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
          url: postUrl,
        });
        toast.success('Post shared successfully!');
      } catch (err) {
        // Only show error if it's not an abort error (user cancelled share)
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          // Fallback to clipboard
          await handleCopyLink(postUrl);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await handleCopyLink(postUrl);
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Post link copied to clipboard!');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      // Fallback for older browsers
      fallbackCopyToClipboard(url);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Post link copied to clipboard!');
      } else {
        toast.error('Failed to copy link. Please copy manually.');
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      toast.error('Failed to copy link. Please copy manually.');
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                {currentPost.author?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <Link 
                to={`/profile/${currentPost.author?.username}`}
                className="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors text-sm truncate block"
              >
                {currentPost.author?.username}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(currentPost.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentPost.isSolved && (
              <CheckCircle className="text-green-500 flex-shrink-0" size={16} title="Solved" />
            )}
            {showSaveButton && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`p-1 rounded transition-colors ${
                  currentPost.isSaved 
                    ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={currentPost.isSaved ? 'Unsave post' : 'Save post'}
              >
                <Bookmark 
                  size={14} 
                  className={currentPost.isSaved ? 'fill-current' : ''}
                />
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-1 rounded text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Share post"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <Link to={`/discussion/${currentPost._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 transition-colors leading-tight">
            {currentPost.title}
          </h3>
          <div 
            className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentPost.content }}
          />
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {currentPost.tags?.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              to={`/search?tag=${tag}`}
              className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition-colors"
            >
              #{tag}
            </Link>
          ))}
          {currentPost.tags?.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{currentPost.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Post Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1.5 transition-colors ${
                currentPost.isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
              } ${isLiking ? 'opacity-50' : ''}`}
            >
              <Heart 
                size={14} 
                className={currentPost.isLiked ? 'fill-current' : ''}
              />
              <span className="font-medium">{currentPost.likeCount || 0}</span>
            </button>

            {/* Comments */}
            <div className="flex items-center space-x-1.5">
              <MessageSquare size={14} />
              <span>{currentPost.commentCount || 0} comments</span>
            </div>
          </div>

          <Link 
            to={`/discussion/${currentPost._id}`}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-xs"
          >
            Read more
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;