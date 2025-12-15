// frontend/src/pages/PostPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Heart,
  MessageSquare,
  Share,
  Bookmark,
  CheckCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ZoomIn // Add this import for image viewing
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout/Layout';
import CommentSection from '../components/Comments/CommentSection';
import { postsAPI } from '../services/postsAPI';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For image modal

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const data = await postsAPI.getPostById(postId);
        setPost(data.post);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load post');
        toast.error('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Add back button handler
  const handleBack = () => {
    navigate('/discussions');
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      setIsLiking(true);
      setPost(prev => ({
        ...prev,
        likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        isLiked: !prev.isLiked
      }));

      const response = await postsAPI.likePost(postId);
      setPost(prev => ({
        ...prev,
        likeCount: response.likeCount,
        isLiked: response.isLiked
      }));

      toast.success(response.isLiked ? 'Post liked!' : 'Like removed!');
    } catch (err) {
      setPost(prev => ({
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
      setPost(prev => ({
        ...prev,
        isSaved: !prev.isSaved
      }));

      const response = await postsAPI.toggleSavePost(postId);
      setPost(prev => ({
        ...prev,
        isSaved: response.isSaved
      }));

      toast.success(response.isSaved ? 'Post saved!' : 'Post unsaved!');
    } catch (err) {
      setPost(prev => ({
        ...prev,
        isSaved: !prev.isSaved
      }));
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/discussion/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
          url: postUrl,
        });
        toast.success('Post shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          await handleCopyLink(postUrl);
        }
      }
    } else {
      await handleCopyLink(postUrl);
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Post link copied to clipboard!');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to copy link. Please copy manually.');
      fallbackCopyToClipboard(url);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
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
      console.error(err);
      toast.error(err?.message || 'Failed to copy link. Please copy manually.');
    }
    document.body.removeChild(textArea);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postsAPI.deletePost(postId);
      toast.success('Post deleted successfully');
      navigate('/discussions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Image modal handlers
  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Handle keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeImageModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  if (isLoading) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto">
          {/* Back Button Skeleton */}
          <div className="mb-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm"
            >
              <ArrowLeft size={16} />
              <span>Back to Discussions</span>
            </button>
          </div>

          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">Error loading post</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Link to="/discussions" className="text-blue-600 hover:text-blue-700">
              Back to Discussions
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isAuthor = user && post.author._id === user.id;
  const isLiked = post.isLiked;
  const isSaved = post.isSaved;

  return (
    <Layout showSidebar={false}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Discussions</span>
          </button>
        </div>

        {/* Post Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link
                to={`/profile/${post.author.username}`}
                className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {post.author.username?.charAt(0).toUpperCase()}
                </span>
              </Link>
              <div>
                <Link
                  to={`/profile/${post.author.username}`}
                  className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
                >
                  {post.author.username}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {post.isSolved && (
                <CheckCircle className="text-green-500" size={20} title="Solved" />
              )}
              {isAuthor && (
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/edit-post/${postId}`}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit Post"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/search?tag=${tag}`}
                className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="mb-6">
            <ReactMarkdown
              className="prose prose-lg dark:prose-invert max-w-none text-gray-900 dark:text-white"
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={dracula}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Images Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Images ({post.images.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      // OLD CODE - Commented out
                      // src={`http://localhost:5000${image.url}`}

                      // NEW CODE - Using environment variable
                      src={`${API_BASE_URL}${image.url}`}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openImageModal(image)}
                      onError={(e) => {
                        console.error('Failed to load image:', image.url);
                        e.target.src = '/api/placeholder/300/200'; // Fallback image
                        e.target.alt = 'Failed to load image';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="text-white" size={24} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Like, Comment & Actions Row */}
          <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-700 py-4">
            <div className="flex items-center space-x-6">
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isLiked
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900'
                  }`}
              >
                <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                <span className="font-semibold">{post.likeCount || 0}</span>
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </button>

              {/* Comment Button - Now clickable */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
              >
                <MessageSquare size={20} />
                <span className="font-semibold">{post.commentCount || 0}</span>
                <span>Comments</span>
                {showComments ? (
                  <ChevronUp size={16} className="ml-1" />
                ) : (
                  <ChevronDown size={16} className="ml-1" />
                )}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isSaved
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900'
                  }`}
              >
                <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Share size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Comments Section - Now inside the post card and collapsible */}
          {showComments && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <CommentSection postId={postId} />
            </div>
          )}
        </div>

        {/* Show comments prompt when collapsed */}
        {!showComments && post.commentCount > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 text-center">
            <button
              onClick={() => setShowComments(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Show {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.url}
              alt="Enlarged post image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              Click outside to close
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PostPage;