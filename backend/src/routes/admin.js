const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { paginationValidation, validate } = require('../middleware/validator');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', adminController.getDashboard);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', paginationValidation, validate, adminController.getAllUsers);

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', paginationValidation, validate, adminController.getAllTransactions);

// @route   POST /api/admin/events/:eventId/upload-banner
// @desc    Upload event banner to IPFS
// @access  Private/Admin
router.post('/events/:eventId/upload-banner', adminController.uploadEventBanner);

module.exports = router;
