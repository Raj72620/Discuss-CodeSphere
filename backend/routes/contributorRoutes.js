// backend/routes/contributorRoutes.js

const express = require('express');
const { getContributors } = require('../controllers/userController');

const router = express.Router();

// Public route to get all contributors
router.get('/contributors', getContributors);

module.exports = router;