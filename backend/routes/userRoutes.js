// backend/routes/userRoutes.js

const express = require('express');
const {
  getContributors,
  getUserProfile,
  updateUserProfile,
  getUserContent
} = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Contributors route (public)
router.get('/users/contributors', getContributors);

// Profile routes
router.get('/:username', optionalAuth, getUserProfile);
router.get('/:username/:type', optionalAuth, getUserContent);
router.put('/', auth, updateUserProfile);

module.exports = router;