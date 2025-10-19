// backend/controllers/commentController.js

const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const postId = req.params.id;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let depth = 0;
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent) {
        depth = parent.depth + 1;
      }
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId,
      parentComment: parentComment || null,
      depth
    });

    await comment.save();

    post.commentCount += 1;
    await post.save();

    await comment.populate('author', 'username avatarUrl');

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
};

// @desc    Like/unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    const userId = req.user._id;

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!comment.likes) {
      comment.likes = [];
    }

    const isLiked = comment.likes.some(likeId => likeId && likeId.toString() === userId.toString());

    if (isLiked) {
      comment.likes = comment.likes.filter(likeId => likeId && likeId.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      likeCount: comment.likes.length,
      isLiked: !isLiked
    });

  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({ message: 'Server error while toggling like' });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (Author only)
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own comments' });
    }

    comment.content = content;
    await comment.save();

    await comment.populate('author', 'username avatarUrl');

    res.json({
      message: 'Comment updated successfully',
      comment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error while updating comment' });
  }
};



// backend/controllers/commentController.js

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Author only)
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own comments' });
    }

    // Find ALL comments to delete (this comment + all its nested replies)
    const findAllNestedComments = async (parentId) => {
      const comments = [];
      
      const findRecursive = async (currentParentId) => {
        const childComments = await Comment.find({ parentComment: currentParentId });
        
        for (const child of childComments) {
          comments.push(child._id);
          await findRecursive(child._id);
        }
      };
      
      await findRecursive(parentId);
      return comments;
    };

    // Get all nested comment IDs to delete
    const nestedCommentIds = await findAllNestedComments(commentId);
    const allCommentIdsToDelete = [commentId, ...nestedCommentIds];
    const totalCommentsToDelete = allCommentIdsToDelete.length;

    console.log(`Deleting ${totalCommentsToDelete} comments:`, allCommentIdsToDelete); // Debug log

    // Delete all comments (main comment + nested replies)
    await Comment.deleteMany({ _id: { $in: allCommentIdsToDelete } });

    // Update post comment count - CRITICAL FIX
    const post = await Post.findById(comment.post);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - totalCommentsToDelete);
      await post.save();
      console.log(`Updated post comment count: ${post.commentCount}`); // Debug log
    }

    res.json({ 
      message: 'Comment and its replies deleted successfully',
      deletedCount: totalCommentsToDelete
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};

// @desc    Mark a comment as solution
// @route   PUT /api/comments/:id/solution
// @access  Private (Post Author only)
const markAsSolution = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate('post');
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the post author can mark a solution' });
    }

    await Comment.updateMany(
      { post: comment.post._id, isSolution: true },
      { isSolution: false }
    );

    comment.isSolution = true;
    await comment.save();

    comment.post.isSolved = true;
    comment.post.solutionComment = commentId;
    await comment.post.save();

    res.json({
      message: 'Comment marked as solution successfully',
      comment
    });

  } catch (error) {
    console.error('Mark solution error:', error);
    res.status(500).json({ message: 'Server error while marking solution' });
  }
};

module.exports = {
  addComment,
  toggleCommentLike,
  updateComment,
  deleteComment,
  markAsSolution
};