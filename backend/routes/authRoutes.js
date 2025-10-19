//backend/routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser, getCurrentUser,googleLogin } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getCurrentUser);
router.post('/google', googleLogin);


// Protected route
router.get('/me', auth, getCurrentUser);

module.exports = router;