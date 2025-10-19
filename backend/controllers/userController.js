// backend/controllers/userController.js

const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get all contributors with pagination
// @route   GET /api/users/contributors
// @access  Public
const getContributors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'postCount';

    // Build query - get all active users
    let query = { isActive: { $ne: false } }; // Include users where isActive is not false
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Get all users with basic info
    const users = await User.find(query)
      .select('username avatarUrl bio joinDate postCount isOnline lastSeen')
      .sort({ postCount: -1, joinDate: -1 }) // Sort by post count first, then join date
      .skip(skip)
      .limit(limit)
      .lean();

    // Process users to ensure they have required fields
    const processedUsers = users.map(user => ({
      _id: user._id,
      username: user.username || 'Unknown',
      avatarUrl: user.avatarUrl || '',
      bio: user.bio || '',
      joinDate: user.joinDate || new Date(),
      postCount: user.postCount || 0,
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen || new Date()
    }));

    // Get total count
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    console.log(`Found ${processedUsers.length} contributors out of ${totalUsers} total users`); // Debug log

    res.json({
      users: processedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get contributors error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching contributors',
      error: error.message 
    });
  }
};

// @desc    Get user profile with stats
// @route   GET /api/profile/:username
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const username = req.params.username;
    
    const user = await User.findOne({ username })
      .select('-passwordHash')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts count
    const postCount = await Post.countDocuments({ author: user._id });
    
    // Get saved posts count
    const savedPostsCount = user.savedPosts ? user.savedPosts.length : 0;

    // Get user's recent posts for profile
    const recentPosts = await Post.find({ author: user._id })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Add like status and counts to posts if user is authenticated
    if (req.user) {
      const userId = req.user._id;
      recentPosts.forEach(post => {
        const likesArray = post.likes || [];
        post.isLiked = likesArray.some(likeId => 
          likeId && likeId.toString() === userId.toString()
        );
        post.likeCount = likesArray.length;
      });
    } else {
      recentPosts.forEach(post => {
        const likesArray = post.likes || [];
        post.isLiked = false;
        post.likeCount = likesArray.length;
      });
    }

    res.json({
      user: {
        ...user,
        postCount,
        savedPostsCount
      },
      posts: recentPosts
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};

// @desc    Get user's posts or saved posts
// @route   GET /api/profile/:username/:type
// @access  Public
const getUserContent = async (req, res) => {
  try {
    const { username, type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let content;
    let total;

    if (type === 'posts') {
      // Get user's posts
      const skip = (page - 1) * limit;
      
      content = await Post.find({ author: user._id })
        .populate('author', 'username avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await Post.countDocuments({ author: user._id });
    } else if (type === 'saved') {
      // Get user's saved posts
      const populatedUser = await User.findById(user._id)
        .populate({
          path: 'savedPosts',
          populate: {
            path: 'author',
            select: 'username avatarUrl'
          },
          options: {
            sort: { createdAt: -1 },
            skip: (page - 1) * limit,
            limit: limit
          }
        });

      content = populatedUser.savedPosts || [];
      total = user.savedPosts ? user.savedPosts.length : 0;
    } else {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    // Add like status and counts
    const userId = req.user ? req.user._id : null;
    content = content.map(item => {
      const itemObj = item.toObject ? item.toObject() : { ...item };
      const likesArray = item.likes || [];
      
      itemObj.isLiked = userId ? 
        likesArray.some(likeId => likeId && likeId.toString() === userId.toString()) : 
        false;
      itemObj.likeCount = likesArray.length;
      
      if (type === 'saved') {
        itemObj.isSaved = true;
      }

      return itemObj;
    });

    res.json({
      [type]: content,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user content error:', error);
    res.status(500).json({ message: 'Server error while fetching user content' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { username, email, bio, avatarUrl } = req.body;
    const userId = req.user._id;

    // Check if username or email is already taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: userId } },
          { $or: [{ email }, { username }] }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email ? 
            'Email already taken' : 'Username already taken'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(username && { username }),
        ...(email && { email }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl })
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

module.exports = {
  getContributors,
  getUserProfile,
  getUserContent,
  updateUserProfile
};