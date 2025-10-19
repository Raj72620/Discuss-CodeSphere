// backend/routes/searchRoutes.js

const express = require('express');
const { searchPosts, getTrendingData } = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchPosts);
router.get('/trending', getTrendingData);

module.exports = router;