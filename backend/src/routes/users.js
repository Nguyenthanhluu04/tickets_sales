const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { walletAddressValidation, validate, paginationValidation } = require('../middleware/validator');

// @route   GET /api/users/:address
// @desc    Get user profile
// @access  Public
router.get('/:address', walletAddressValidation, validate, userController.getUserProfile);

// @route   PUT /api/users/:address
// @desc    Update user profile
// @access  Private
router.put('/:address', protect, walletAddressValidation, validate, userController.updateUserProfile);

// @route   GET /api/users/:address/tickets
// @desc    Get user's tickets
// @access  Public
router.get('/:address/tickets', walletAddressValidation, paginationValidation, validate, userController.getUserTickets);

// @route   GET /api/users/:address/events
// @desc    Get user's organized events
// @access  Public
router.get('/:address/events', walletAddressValidation, paginationValidation, validate, userController.getUserEvents);

module.exports = router;
