// frontend/src/components/Posts/PostForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../../services/postsAPI';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const PostForm = ({ initialData = {}, isEdit = false }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [tags, setTags] = useState(initialData.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let response;
      if (isEdit) {
        response = await postsAPI.updatePost(initialData._id, {
          title: title.trim(),
          content: content.trim(),
          tags
        });
        toast.success('Post updated successfully!');
      } else {
        response = await postsAPI.createPost({
          title: title.trim(),
          content: content.trim(),
          tags
        });
        toast.success('Post created successfully!');
      }
      
      // Redirect to the newly created/updated post page
      navigate(`/discussion/${response.post._id}`);
      
    } catch (err) {
      console.error('Post form error:', err);
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} post`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleBack = () => {
    navigate('/discussions');
  };

  return (
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

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isEdit ? 'Edit Discussion' : 'Create New Discussion'}
        </h2>
        
        {/* Title Field */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Content Field */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here... (Supports HTML)"
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            required
          />
        </div>

        {/* Tags Field */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;