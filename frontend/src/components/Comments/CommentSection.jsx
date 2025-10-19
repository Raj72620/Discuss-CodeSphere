// frontend/src/components/Comments/CommentSection.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Lock } from 'lucide-react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { postsAPI } from '../../services/postsAPI';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCommentCount, setTotalCommentCount] = useState(0); // Add this state
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Function to count all comments including nested replies
  const countAllComments = (commentsArray) => {
    let count = 0;
    
    const countRecursive = (comments) => {
      comments.forEach(comment => {
        count++;
        if (comment.replies && comment.replies.length > 0) {
          countRecursive(comment.replies);
        }
      });
    };
    
    countRecursive(commentsArray);
    return count;
  };

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await postsAPI.getPostById(postId);
      setComments(data.comments || []);
      
      // Count all comments including nested replies
      const totalCount = countAllComments(data.comments || []);
      setTotalCommentCount(totalCount);
      
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentAdded = () => {
    fetchComments(); // Refresh comments after adding
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <MessageSquare size={24} />
          <span>Comments ({totalCommentCount})</span> {/* Use totalCommentCount instead of comments.length */}
        </h3>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center mb-6">
          <Lock size={20} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Please <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">login</a> to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      <CommentList 
        comments={comments} 
        onCommentUpdate={fetchComments}
        postId={postId}
      />
    </div>
  );
};

export default CommentSection;