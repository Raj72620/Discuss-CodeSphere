// backend/controllers/postController.js

const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get all posts with pagination and filtering
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const tag = req.query.tag;
    const author = req.query.author;
    const search = req.query.search;

    // Build query object
    let query = {};

    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get posts with author population and pagination
    const posts = await Post.find(query)
      .populate('author', 'username avatarUrl')
      .sort({ [sortBy]: sortOrder, _id: -1 }) // Add _id for tie-breaking and consistent sorting
      .skip(skip)
      .limit(limit)
      .lean();

    // Check if user liked each post and add save status
    if (req.user) {
      const userId = req.user._id;
      posts.forEach(post => {
        // Ensure likes array exists and is an array
        const likesArray = post.likes || [];
        post.isLiked = likesArray.some(likeId => likeId && likeId.toString() === userId.toString());
        post.likeCount = likesArray.length;

        // Check if user saved this post
        const savedByArray = post.savedBy || [];
        post.isSaved = savedByArray.some(savedUserId => savedUserId && savedUserId.toString() === userId.toString());
      });
    } else {
      posts.forEach(post => {
        // Ensure likes array exists and is an array
        const likesArray = post.likes || [];
        post.isLiked = false;
        post.likeCount = likesArray.length;
        post.isSaved = false;
      });
    }

    // Get total count for pagination info
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

// @desc    Get single post with comments
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatarUrl bio joinDate')
      .populate('solutionComment');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Convert to object and add like/save status
    const postObj = post.toObject();
    const likesArray = post.likes || [];
    const savedByArray = post.savedBy || [];

    if (req.user) {
      postObj.isLiked = likesArray.some(likeId =>
        likeId && likeId.toString() === req.user._id.toString()
      );
      postObj.isSaved = savedByArray.some(savedUserId =>
        savedUserId && savedUserId.toString() === req.user._id.toString()
      );
    } else {
      postObj.isLiked = false;
      postObj.isSaved = false;
    }
    postObj.likeCount = likesArray.length;

    // Increment view count
    post.views += 1;
    await post.save();

    // Get comments with author info and proper sorting
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: 1 })
      .lean();

    // Check if user liked each comment
    if (req.user) {
      const userId = req.user._id;
      comments.forEach(comment => {
        const commentLikesArray = comment.likes || [];
        comment.isLiked = commentLikesArray.some(likeId =>
          likeId && likeId.toString() === userId.toString()
        );
        comment.likeCount = commentLikesArray.length;
      });
    } else {
      comments.forEach(comment => {
        const commentLikesArray = comment.likes || [];
        comment.isLiked = false;
        comment.likeCount = commentLikesArray.length;
      });
    }

    // Structure comments into nested format
    const nestComments = (comments, parentId = null) => {
      return comments
        .filter(comment =>
          (parentId === null && !comment.parentComment) ||
          (comment.parentComment && comment.parentComment.toString() === parentId)
        )
        .map(comment => ({
          ...comment,
          replies: nestComments(comments, comment._id.toString())
        }));
    };

    const nestedComments = nestComments(comments);

    res.json({
      post: postObj,
      comments: nestedComments
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error while fetching post' });
  }
};

// @desc    Like/unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ensure likes array exists
    if (!post.likes) {
      post.likes = [];
    }

    const isLiked = post.likes.some(likeId => likeId && likeId.toString() === userId.toString());

    if (isLiked) {
      // Unlike - remove user from likes array
      post.likes = post.likes.filter(likeId => likeId && likeId.toString() !== userId.toString());
    } else {
      // Like - add user to likes array
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likeCount: post.likes.length,
      isLiked: !isLiked
    });

  } catch (error) {
    console.error('Toggle post like error:', error);
    res.status(500).json({ message: 'Server error while toggling like' });
  }
};


// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, tags, images } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Process tags - convert to lowercase and remove duplicates
    const processedTags = tags ?
      [...new Set(tags.map(tag => tag.toLowerCase().trim()))] : [];

    const post = new Post({
      title,
      content,
      tags: processedTags,
      images: images || [], // Add images field
      author: req.user._id
    });

    await post.save();

    // Populate author info for response
    await post.populate('author', 'username avatarUrl');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error while creating post' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Author only)
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own posts' });
    }

    const { title, content, tags, images } = req.body;

    // Update fields if provided
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) {
      post.tags = [...new Set(tags.map(tag => tag.toLowerCase().trim()))];
    }
    if (images !== undefined) {
      post.images = images; // Update images array
    }

    await post.save();
    await post.populate('author', 'username avatarUrl');

    res.json({
      message: 'Post updated successfully',
      post
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error while updating post' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePostLike
};