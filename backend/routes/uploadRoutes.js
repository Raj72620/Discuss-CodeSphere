// backend/routes/uploadRoutes.js

const express = require('express');
const { uploadPostImages, deleteImage } = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/upload/posts', auth, uploadPostImages);
router.delete('/upload/posts/:filename', auth, deleteImage);

module.exports = router;