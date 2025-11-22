const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

// @route   POST /api/auth/login
// @desc    Login with wallet signature
// @access  Public
router.post('/login', authLimiter, loginValidation, validate, authController.login);

// @route   GET /api/auth/nonce/:walletAddress
// @desc    Get nonce for wallet
// @access  Public
router.get('/nonce/:walletAddress', authController.getNonce);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, authController.getMe);

module.exports = router;
