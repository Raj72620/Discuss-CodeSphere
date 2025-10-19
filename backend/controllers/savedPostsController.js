// backend/controllers/savedPostsController.js

const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// @desc    Toggle save/unsave a post
// @route   POST /api/posts/:id/save
// @access  Private
const toggleSavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if post is already saved
    const isSaved = user.savedPosts && user.savedPosts.some(savedPostId => 
      savedPostId.toString() === postId.toString()
    );

    if (isSaved) {
      // Unsave - remove from user's saved posts and post's savedBy
      user.savedPosts = user.savedPosts.filter(savedPostId => 
        savedPostId.toString() !== postId.toString()
      );
      
      if (post.savedBy) {
        post.savedBy = post.savedBy.filter(savedUserId => 
          savedUserId.toString() !== userId.toString()
        );
      }
    } else {
      // Save - add to user's saved posts and post's savedBy
      if (!user.savedPosts) user.savedPosts = [];
      user.savedPosts.push(postId);
      
      if (!post.savedBy) post.savedBy = [];
      post.savedBy.push(userId);
    }

    await user.save();
    await post.save();

    res.json({
      message: isSaved ? 'Post unsaved successfully' : 'Post saved successfully',
      isSaved: !isSaved
    });

  } catch (error) {
    console.error('Toggle save post error:', error);
    res.status(500).json({ message: 'Server error while saving post' });
  }
};

// @desc    Get user's saved posts
// @route   GET /api/posts/saved
// @access  Private
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: {
        path: 'author',
        select: 'username avatarUrl'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process saved posts to include like status and ensure all fields
    const savedPosts = user.savedPosts.map(post => {
      const postObj = post.toObject();
      
      // Check if current user liked this post
      const likesArray = post.likes || [];
      postObj.isLiked = likesArray.some(likeId => 
        likeId && likeId.toString() === req.user._id.toString()
      );
      postObj.likeCount = likesArray.length;
      
      // Always true since these are saved posts
      postObj.isSaved = true;
      
      // Ensure commentCount exists (using your schema's commentCount field)
      postObj.commentCount = post.commentCount || 0;

      return postObj;
    });

    // Sort by most recently saved first (newest first)
    const sortedSavedPosts = savedPosts.reverse();

    res.json({
      message: 'Saved posts retrieved successfully',
      savedPosts: sortedSavedPosts
    });

  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ message: 'Server error while fetching saved posts' });
  }
};

module.exports = {
  toggleSavePost,
  getSavedPosts
};