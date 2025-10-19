// frontend/src/components/UI/ImageUpload.jsx

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api';

const ImageUpload = ({ images = [], onImagesChange, maxImages = 5 }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [removingImage, setRemovingImage] = useState(null); // Track which image is being removed

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Check total image count
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast.error(`${file.name}: Only image files are allowed`);
        return false;
      }

      if (!isValidSize) {
        toast.error(`${file.name}: File size must be less than 5MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Upload files
    await uploadFiles(validFiles);
    
    // Reset file input
    event.target.value = '';
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('token');
      
      // OLD CODE - Commented out
      // const response = await fetch('http://localhost:5000/api/upload/posts', {
      
      // NEW CODE - Using environment variable
      const response = await fetch(`${API_BASE_URL}/api/upload/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Add new images to the list
      onImagesChange([...images, ...data.images]);
      toast.success(`Successfully uploaded ${data.images.length} image(s)`);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (imageToRemove) => {
    setRemovingImage(imageToRemove.filename);

    try {
      const token = localStorage.getItem('token');
      
      // OLD CODE - Commented out
      // const deleteResponse = await fetch(`http://localhost:5000/api/upload/posts/${imageToRemove.filename}`, {
      
      // NEW CODE - Using environment variable
      const deleteResponse = await fetch(`${API_BASE_URL}/api/upload/posts/${imageToRemove.filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.message || 'Failed to delete image from server');
      }

      // Remove from local state - this will trigger the parent's onImagesChange
      const updatedImages = images.filter(img => img.filename !== imageToRemove.filename);
      onImagesChange(updatedImages);
      
      toast.success('Image removed successfully');

    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to remove image');
      
      // Even if server deletion fails, remove from UI to keep state consistent
      const updatedImages = images.filter(img => img.filename !== imageToRemove.filename);
      onImagesChange(updatedImages);
    } finally {
      setRemovingImage(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect({ target: { files } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Images ({images.length}/{maxImages})
      </label>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-blue-500 mb-2" size={32} />
            <p className="text-gray-600 dark:text-gray-400">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="text-gray-400 mb-2" size={32} />
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              Drag & drop images here or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports JPEG, PNG, GIF, WEBP, BMP • Max 5MB per image • Up to {maxImages} images
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  // OLD CODE - Commented out
                  // src={`http://localhost:5000${image.url}`}
                  
                  // NEW CODE - Using environment variable
                  src={`${API_BASE_URL}${image.url}`}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', image.url);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', image.url)}
                />
                
                {/* Loading overlay when removing */}
                {removingImage === image.filename && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader className="animate-spin text-white" size={24} />
                  </div>
                )}
              </div>
              
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image);
                }}
                disabled={removingImage === image.filename}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <X size={14} />
              </button>

              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="truncate">{image.filename}</div>
                <div>{formatFileSize(image.size)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;