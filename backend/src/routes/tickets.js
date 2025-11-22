const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');
const { checkInValidation, validate, paginationValidation } = require('../middleware/validator');
const { purchaseLimiter } = require('../middleware/rateLimiter');

// @route   POST /api/tickets/sync
// @desc    Sync ticket purchase from blockchain
// @access  Private
router.post('/sync', protect, purchaseLimiter, ticketController.syncTicketPurchase);

// @route   GET /api/tickets/my-tickets
// @desc    Get user's tickets
// @access  Private
router.get('/my-tickets', protect, paginationValidation, validate, ticketController.getMyTickets);

// @route   GET /api/tickets/verify/:tokenId
// @desc    Verify ticket
// @access  Public
router.get('/verify/:tokenId', ticketController.verifyTicket);

// @route   POST /api/tickets/checkin
// @desc    Check-in ticket
// @access  Private (Organizer/Admin)
router.post(
  '/checkin',
  protect,
  authorize('organizer', 'admin'),
  checkInValidation,
  validate,
  ticketController.checkInTicket
);

// @route   GET /api/tickets/:tokenId
// @desc    Get ticket details
// @access  Public
router.get('/:tokenId', ticketController.getTicketDetails);

module.exports = router;
