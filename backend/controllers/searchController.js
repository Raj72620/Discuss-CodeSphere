// backend/controllers/searchController.js

const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Search posts with filters
// @route   GET /api/search
// @access  Public
const searchPosts = async (req, res) => {
  try {
    const {
      q: searchQuery,
      tags,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    let query = {};

    // Text search
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Tag filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray.map(tag => tag.toLowerCase()) };
    }

    // Author filter
    if (author) {
      const user = await User.findOne({ username: author });
      if (user) {
        query.author = user._id;
      } else {
        // If author doesn't exist, return empty results
        query.author = null;
      }
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute search
    const posts = await Post.find(query)
      .populate('author', 'username avatarUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Post.countDocuments(query);

    // Get trending tags
    const trendingTags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      results: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        searchQuery,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
        author
      },
      trendingTags: trendingTags.map(tag => ({ name: tag._id, count: tag.count }))
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
};

// @desc    Get trending data (tags, contributors, etc.)
// @route   GET /api/trending
// @access  Public
const getTrendingData = async (req, res) => {
  try {
    // Limit analysis to last 30 days for performance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [topContributors, trendingTags, recentPopularPosts] = await Promise.all([
      // Top contributors (users with most posts in last 30 days)
      Post.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$author', postCount: { $sum: 1 } } },
        { $sort: { postCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            username: '$user.username',
            avatarUrl: '$user.avatarUrl',
            postCount: 1
          }
        }
      ]),

      // Trending tags (last 30 days only)
      Post.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),

      // Recent popular posts
      Post.find()
        .populate('author', 'username avatarUrl')
        .sort({ views: -1, createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      topContributors,
      trendingTags: trendingTags.map(tag => ({ name: tag._id, count: tag.count })),
      recentPopularPosts
    });

  } catch (error) {
    console.error('Trending data error:', error);
    res.status(500).json({ message: 'Server error while fetching trending data' });
  }
};

module.exports = {
  searchPosts,
  getTrendingData
};