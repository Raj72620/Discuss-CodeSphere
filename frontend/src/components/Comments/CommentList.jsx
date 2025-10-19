// frontend/src/components/Comments/CommentList.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Heart, MessageSquare, Edit, Trash2, CheckCircle, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { commentsAPI } from '../../services/commentsAPI';
import { toast } from 'react-hot-toast';
import CommentForm from './CommentForm';

const CommentList = ({ comments, onCommentUpdate, postId }) => {
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      await commentsAPI.likeComment(commentId);
      onCommentUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to like comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.deleteComment(commentId);
      toast.success('Comment deleted successfully');
      onCommentUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      await commentsAPI.updateComment(commentId, { content });
      toast.success('Comment updated successfully');
      setEditingComment(null);
      onCommentUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleMarkAsSolution = async (commentId) => {
    try {
      await commentsAPI.markAsSolution(commentId);
      toast.success('Comment marked as solution');
      onCommentUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as solution');
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const isAuthor = user && comment.author._id === user.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showReplies = expandedReplies[comment._id];
    
    return (
      <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                    {comment.author?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {comment.author?.username}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
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
              {user && comment.post && comment.post.author === user.id && !comment.isSolution && (
                <button
                  onClick={() => handleMarkAsSolution(comment._id)}
                  className="text-xs text-green-600 hover:text-green-700 transition-colors"
                  title="Mark as solution"
                >
                  <CheckCircle size={14} />
                </button>
              )}
              {isAuthor && (
                <>
                  <button
                    onClick={() => setEditingComment(editingComment === comment._id ? null : comment._id)}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit comment"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Comment Content */}
          {editingComment === comment._id ? (
            <CommentForm
              postId={postId}
              initialContent={comment.content}
              isEdit={true}
              onCommentAdded={(updatedComment) => {
                handleEditComment(comment._id, updatedComment.content);
              }}
              onCancel={() => setEditingComment(null)}
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              {comment.content}
            </p>
          )}

          {/* Comment Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs">
              <button
                onClick={() => handleLikeComment(comment._id)}
                className={`flex items-center space-x-1 transition-colors ${
                  comment.isLiked 
                    ? 'text-red-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart size={14} className={comment.isLiked ? 'fill-current' : ''} />
                <span>{comment.likeCount || 0}</span>
              </button>
              
              {depth < 2 && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Reply size={14} />
                  <span>Reply</span>
                </button>
              )}
            </div>

            {/* Show Replies Toggle */}
            {hasReplies && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>{showReplies ? 'Hide' : 'Show'} {comment.replies.length} reply{comment.replies.length !== 1 ? 'ies' : ''}</span>
                {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentComment={comment._id}
                onCommentAdded={() => {
                  setReplyingTo(null);
                  onCommentUpdate();
                }}
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          )}
        </div>

        {/* Nested Replies - Only show when expanded */}
        {showReplies && comment.replies && comment.replies.map(reply => (
          <CommentItem 
            key={reply._id} 
            comment={reply} 
            depth={depth + 1}
          />
        ))}
      </div>
    );
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto text-gray-400 dark:text-gray-500 mb-2" size={32} />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No comments yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;