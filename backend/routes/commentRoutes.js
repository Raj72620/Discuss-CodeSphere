// backend/routes/commentRoutes.js

const express = require('express');
const { 
  toggleCommentLike, 
  markAsSolution,
  updateComment,
  deleteComment 
} = require('../controllers/commentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Like/unlike a comment
router.post('/:id/like', auth, toggleCommentLike);

// Mark comment as solution
router.put('/:id/solution', auth, markAsSolution);

// Update a comment
router.put('/:id', auth, updateComment);

// Delete a comment
router.delete('/:id', auth, deleteComment);

module.exports = router;