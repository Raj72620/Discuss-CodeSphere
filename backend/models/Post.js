// backend/models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  images: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  solutionComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }
}, {
  timestamps: true
});

// Index for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ likes: -1 });

// Method to check if user liked the post
postSchema.methods.isLikedByUser = function(userId) {
  return this.likes.some(likeId => likeId && likeId.toString() === userId.toString());
};

// Method to check if user saved the post
postSchema.methods.isSavedByUser = function(userId) {
  return this.savedBy.some(savedUserId => savedUserId && savedUserId.toString() === userId.toString());
};

module.exports = mongoose.model('Post', postSchema);