// backend/routes/postRoutes.js

const express = require('express');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePostLike
} = require('../controllers/postController');
const { toggleSavePost, getSavedPosts } = require('../controllers/savedPostsController');
const { addComment } = require('../controllers/commentController'); 
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.get('/saved', auth, getSavedPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/', auth, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, togglePostLike);
router.post('/:id/save', auth, toggleSavePost);
router.post('/:id/comments', auth, addComment); 

module.exports = router;