// frontend/src/pages/EditPostPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Save, X, Tag as TagIcon, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import RichTextEditor from '../components/Editor/RichTextEditor';
import ImageUpload from '../components/UI/ImageUpload';
import { postsAPI } from '../services/postsAPI';
import { toast } from 'react-hot-toast';

const EditPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    images: []
  });
  const [tagInput, setTagInput] = useState('');
  const [originalPost, setOriginalPost] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const data = await postsAPI.getPostById(postId);
      
      // Check if user is the author
      if (user.id !== data.post.author._id) {
        toast.error('You can only edit your own posts');
        navigate(`/discussion/${postId}`);
        return;
      }

      setOriginalPost(data.post);
      setFormData({
        title: data.post.title,
        content: data.post.content,
        tags: data.post.tags || [],
        images: data.post.images || []
      });
      setHasUnsavedChanges(false);
    } catch {
      toast.error('Failed to load post');
      navigate('/discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await postsAPI.updatePost(postId, formData);
      toast.success('Post updated successfully!');
      setHasUnsavedChanges(false);
      navigate(`/discussion/${postId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
      setHasUnsavedChanges(true);
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    setHasUnsavedChanges(true);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Handle images change - this only updates local state
  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
    setHasUnsavedChanges(true);
  };

  // Handle individual field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }
    navigate(`/discussion/${postId}`);
  };

  if (isLoading) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!originalPost) {
    return null;
  }

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
            <span>Back to Post</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Discussion
            </h1>
            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-500 font-medium">
                    • Unsaved changes
                </span>
              )}
              <button
                onClick={handleBack}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                maxLength={200}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.title.length}/200 characters
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleFieldChange('content', content)}
              />
            </div>

            {/* Image Upload */}
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={5}
            />

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="flex items-center space-x-1 px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <TagIcon size={16} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting || !hasUnsavedChanges}
                className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Save size={20} />
                <span>{isSubmitting ? 'Updating...' : 'Update Discussion'}</span>
              </button>
              
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditPostPage;