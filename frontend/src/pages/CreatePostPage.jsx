// frontend/src/pages/CreatePostPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Save, X, Tag as TagIcon, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import RichTextEditor from '../components/Editor/RichTextEditor';
import ImageUpload from '../components/UI/ImageUpload'; // Add this import
import { postsAPI } from '../services/postsAPI';
import { toast } from 'react-hot-toast';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    images: [] // Add images to form data
  });
  const [tagInput, setTagInput] = useState('');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to create a post');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await postsAPI.createPost(formData);
      toast.success('Post created successfully!');
      navigate(`/discussion/${response.post._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
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
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Handle images change
  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleBack = () => {
    navigate('/discussions');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
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
            <span>Back to Discussions</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Discussion
            </h1>
            <button
              onClick={handleBack}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
              <span>Cancel</span>
            </button>
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
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for your discussion..."
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
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Describe your coding problem, share your insights, or ask your question..."
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
                  placeholder="Add tags (e.g., javascript, react, nodejs)"
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
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add up to 5 tags to help others find your discussion
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Save size={20} />
                <span>{isSubmitting ? 'Creating Post...' : 'Create Discussion'}</span>
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

        {/* Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Discussion Guidelines
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Be specific and provide code examples when possible</li>
            <li>• Use descriptive titles that summarize the problem</li>
            <li>• Add relevant images to better explain your issue</li>
            <li>• Choose relevant tags to help others find your post</li>
            <li>• Be respectful and follow community guidelines</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePostPage;