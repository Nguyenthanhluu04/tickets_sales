const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const CheckInLog = require('../models/CheckInLog');
const { apiResponse, paginate } = require('../utils/helpers');
const { logger } = require('../utils/logger');
const blockchainService = require('../services/blockchainService');
const qrCodeService = require('../services/qrCodeService');

/**
 * @desc Sync ticket purchase from blockchain
 * @route POST /api/tickets/sync
 */
exports.syncTicketPurchase = async (req, res) => {
  try {
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json(apiResponse(false, 'Transaction hash required'));
    }

    // Wait for transaction confirmation
    const receipt = await blockchainService.waitForTransaction(transactionHash, 2);

    if (!receipt || receipt.status !== 1) {
      return res.status(400).json(apiResponse(false, 'Transaction failed'));
    }

    logger.info(`Ticket purchase synced: ${transactionHash}`);

    res.json(apiResponse(true, 'Ticket synced successfully', { receipt }));
  } catch (error) {
    logger.error('Sync ticket error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get user's tickets
 * @route GET /api/tickets/my-tickets
 */
exports.getMyTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userAddress = req.user.walletAddress;

    const query = { owner: userAddress };
    const total = await Ticket.countDocuments(query);

    const tickets = await Ticket.find(query)
      .sort({ purchasedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get event details for each ticket
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await Event.findOne({ eventId: ticket.eventId }).lean();
        
        // Generate QR code if not exists
        if (!ticket.qrCode) {
          const { qrCode } = await qrCodeService.generateTicketQR({
            tokenId: ticket.tokenId,
            eventId: ticket.eventId,
            owner: ticket.owner,
          });
          
          await Ticket.updateOne({ _id: ticket._id }, { qrCode });
          ticket.qrCode = qrCode;
        }

        return {
          ...ticket,
          event,
        };
      })
    );

    res.json(apiResponse(true, 'Tickets retrieved', paginate(ticketsWithDetails, page, limit, total)));
  } catch (error) {
    logger.error('Get my tickets error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Verify ticket
 * @route GET /api/tickets/verify/:tokenId
 */
exports.verifyTicket = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const ticket = await Ticket.findOne({ tokenId }).lean();
    
    if (!ticket) {
      return res.status(404).json(apiResponse(false, 'Ticket not found'));
    }

    // Verify on blockchain
    const isValid = await blockchainService.verifyOwnership(ticket.ticketTypeId, ticket.owner);

    if (!isValid) {
      return res.status(400).json(apiResponse(false, 'Invalid ticket ownership'));
    }

    const event = await Event.findOne({ eventId: ticket.eventId }).lean();

    res.json(apiResponse(true, 'Ticket verified', {
      ticket,
      event,
      isValid,
      isUsed: ticket.isUsed,
    }));
  } catch (error) {
    logger.error('Verify ticket error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Check-in ticket
 * @route POST /api/tickets/checkin
 */
exports.checkInTicket = async (req, res) => {
  try {
    const { qrData, location } = req.body;

    if (!qrData) {
      return res.status(400).json(apiResponse(false, 'QR data required'));
    }

    // Verify QR code
    const verification = qrCodeService.verifyQRData(qrData);
    
    if (!verification.valid) {
      return res.status(400).json(apiResponse(false, verification.reason));
    }

    const { tokenId, eventId, owner } = verification.payload;

    // Check ticket
    const ticket = await Ticket.findOne({ tokenId, owner: owner.toLowerCase() });
    
    if (!ticket) {
      return res.status(404).json(apiResponse(false, 'Ticket not found'));
    }

    if (ticket.isUsed) {
      return res.status(400).json(apiResponse(false, 'Ticket already used'));
    }

    // Mark as used
    ticket.isUsed = true;
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = req.user.walletAddress;
    await ticket.save();

    // Create check-in log
    await CheckInLog.create({
      tokenId,
      eventId,
      ticketHolder: owner.toLowerCase(),
      checkedInBy: req.user.walletAddress,
      location,
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    logger.info(`Ticket checked in: ${tokenId}`);

    res.json(apiResponse(true, 'Check-in successful', { ticket }));
  } catch (error) {
    logger.error('Check-in error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get ticket details
 * @route GET /api/tickets/:tokenId
 */
exports.getTicketDetails = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const ticket = await Ticket.findOne({ tokenId }).lean();
    
    if (!ticket) {
      return res.status(404).json(apiResponse(false, 'Ticket not found'));
    }

    const event = await Event.findOne({ eventId: ticket.eventId }).lean();
    const ticketType = await TicketType.findOne({ tokenId: ticket.ticketTypeId }).lean();

    res.json(apiResponse(true, 'Ticket details retrieved', {
      ticket,
      event,
      ticketType,
    }));
  } catch (error) {
    logger.error('Get ticket details error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};
