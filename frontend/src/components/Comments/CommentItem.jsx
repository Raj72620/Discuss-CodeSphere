// frontend/src/components/Comments/CommentItem.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Heart,
  Reply, 
  CheckCircle, 
  Edit, 
  Trash2
} from 'lucide-react';
import { commentsAPI } from '../../services/commentsAPI';
import { toast } from 'react-hot-toast';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, depth, onCommentUpdate, postId }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isAuthor = user && comment.author._id === user.id;
  const canMarkSolution = user && postId && user.id === postId.author?._id;

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }
    
    try {
      setIsLiking(true);
      
      // Optimistically update UI - we don't need to store this in a variable
      // since we're refreshing comments after the API call
      
      const response = await commentsAPI.likeComment(comment._id);
      toast.success(response.isLiked ? 'Comment liked!' : 'Like removed!');
      onCommentUpdate(); // Refresh comments to get updated like status
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to like comment');
    } finally {
      setIsLiking(false);
    }
  };

  const handleMarkSolution = async () => {
    try {
      await commentsAPI.markAsSolution(comment._id);
      toast.success('Comment marked as solution!');
      onCommentUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark solution');
    }
  };

const handleDelete = async () => {
  if (!window.confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  try {
    await commentsAPI.deleteComment(comment._id);
    toast.success('Comment deleted successfully');
    onCommentUpdate(); // This should refresh the entire comment list
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete comment');
  }
};

  const handleReplyAdded = () => {
    setIsReplying(false);
    onCommentUpdate();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Use isLiked and likeCount from backend
  const isLiked = comment.isLiked;
  const likeCount = comment.likeCount || 0;

  return (
    <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${depth > 0 ? 'border border-gray-200 dark:border-gray-600' : ''}`}>
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Link 
            to={`/profile/${comment.author.username}`}
            className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
              {comment.author.username?.charAt(0).toUpperCase()}
            </span>
          </Link>
          <div>
            <Link 
              to={`/profile/${comment.author.username}`}
              className="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors text-sm"
            >
              {comment.author.username}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
            </p>
          </div>
          {comment.isSolution && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
              <CheckCircle size={12} className="mr-1" />
              Solution
            </span>
          )}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center space-x-2">
          {canMarkSolution && !comment.isSolution && (
            <button
              onClick={handleMarkSolution}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              title="Mark as solution"
            >
              <CheckCircle size={14} />
            </button>
          )}
          
          {isAuthor && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                title="Edit comment"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                title="Delete comment"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <CommentForm 
          postId={postId}
          parentComment={comment._id}
          initialContent={comment.content}
          onCommentAdded={handleReplyAdded}
          onCancel={() => setIsEditing(false)}
          isEdit={true}
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-white mb-3">
          {comment.content}
        </div>
      )}

      {/* Comment Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`p-1 rounded transition-colors ${
                isLiked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart 
                size={14} 
                className={isLiked ? 'fill-current' : ''}
              />
            </button>
            
            <span className={`text-sm font-medium min-w-[20px] text-center ${
              likeCount > 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {likeCount}
            </span>
          </div>

          {/* Reply Button */}
          {isAuthenticated && depth < 3 && !isEditing && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="mt-4">
          <CommentForm 
            postId={postId}
            parentComment={comment._id}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CommentItem;