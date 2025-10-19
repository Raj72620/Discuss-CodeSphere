// backend/controllers/authController.js

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'User with this email already exists' : 'Username is already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      passwordHash: await bcrypt.hash(password, 12)
    });

    await user.save();

    // Generate token and send response
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        joinDate: user.joinDate,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token and send response
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        joinDate: user.joinDate,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: 'Google access token is required' });
    }

    // Verify the Google token
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    
    if (!response.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const googleUser = await response.json();

    if (!googleUser.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    // Check if user exists
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Generate unique username from Google name
      let baseUsername = googleUser.name
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
      
      // Ensure username is unique
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user
      user = new User({
        username,
        email: googleUser.email,
        avatarUrl: googleUser.picture,
        isEmailVerified: true,
        authProvider: 'google'
      });

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Get post count for user stats
    const Post = require('../models/Post');
    const postCount = await Post.countDocuments({ author: user._id });

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        joinDate: user.joinDate,
        role: user.role,
        postCount
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// @desc    Get current user profile with real stats
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const Post = require('../models/Post');
    const user = await User.findById(req.user._id)
      .populate('savedPosts')
      .select('-passwordHash');
    
    // Get post count
    const postCount = await Post.countDocuments({ author: req.user._id });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        joinDate: user.joinDate,
        role: user.role,
        postCount,
        savedPosts: user.savedPosts || []
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser
};