// frontend/src/components/Comments/CommentForm.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Send, X } from 'lucide-react';
import { commentsAPI } from '../../services/commentsAPI';
import { toast } from 'react-hot-toast';

const CommentForm = ({ 
  postId, 
  parentComment = null, 
  initialContent = '', 
  onCommentAdded, 
  onCancel,
  isEdit = false 
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await commentsAPI.addComment(postId, {
        content: content.trim(),
        parentComment: parentComment
      });
      
      toast.success(isEdit ? 'Comment updated!' : 'Comment added!');
      setContent('');
      
      if (onCommentAdded) {
        onCommentAdded(response.comment);
      }
    } catch (err) {
      console.error('Add comment error:', err);
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isEdit ? "Edit your comment..." : "Write your comment..."}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          disabled={isSubmitting}
          maxLength={1000}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {content.length}/1000 characters
        </div>
        
        <div className="flex items-center space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center space-x-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Send size={16} />
            <span>{isSubmitting ? 'Posting...' : isEdit ? 'Update' : 'Comment'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;