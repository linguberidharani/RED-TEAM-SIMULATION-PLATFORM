const express = require('express');
const router = express.Router();
const { register, sendOtp, verifyOtp, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register',   register);
router.post('/send-otp',   sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login',      login);

// Protected route — returns current user from JWT
router.get('/me', protect, getMe);

module.exports = router;