// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: function() {
      return this.authProvider === 'local'; // Only required for local auth
    }
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  // Chat related fields
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  chatSettings: {
    allowMessages: {
      type: Boolean,
      default: true
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    }
  },

  // Google OAuth fields - ADDED HERE
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for post count
userSchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
  count: true
});

// Method to check password
userSchema.methods.checkPassword = async function(password) {
  // For Google OAuth users, they don't have passwords
  if (this.authProvider === 'google') {
    return false;
  }
  return await bcrypt.compare(password, this.passwordHash);
};

// Remove password hash from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);