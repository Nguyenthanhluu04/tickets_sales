const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { createEventValidation, validate, paginationValidation } = require('../middleware/validator');

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', paginationValidation, validate, eventController.getAllEvents);

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', eventController.getEventById);

// @route   POST /api/events
// @desc    Create event
// @access  Private (Organizer/Admin)
router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  createEventValidation,
  validate,
  eventController.createEvent
);

// @route   GET /api/events/:id/stats
// @desc    Get event statistics
// @access  Public
router.get('/:id/stats', eventController.getEventStats);

// @route   POST /api/events/sync
// @desc    Sync event from blockchain to database
// @access  Public (for now)
router.post('/sync', eventController.syncEventFromBlockchain);

// @route   POST /api/events/:id/ticket-types/sync
// @desc    Sync ticket type from blockchain to database
// @access  Public (for now)
router.post('/:id/ticket-types/sync', eventController.syncTicketTypeFromBlockchain);

// @route   PATCH /api/events/:id/toggle-status
// @desc    Toggle event active status
// @access  Private (Organizer/Admin)
router.patch('/:id/toggle-status', protect, authorize('organizer', 'admin'), eventController.toggleEventStatus);

// @route   POST /api/events/:id/upload-banner
// @desc    Upload event banner to IPFS
// @access  Private (Organizer/Admin)
router.post('/:id/upload-banner', protect, eventController.uploadEventBanner);

module.exports = router;
