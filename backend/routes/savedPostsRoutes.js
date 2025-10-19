// backend/routes/savedPostsRoutes.js

const express = require('express');
const { toggleSavePost, getSavedPosts } = require('../controllers/savedPostsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/posts/:id/save', auth, toggleSavePost);
router.get('/posts/saved', auth, getSavedPosts);

module.exports = router;