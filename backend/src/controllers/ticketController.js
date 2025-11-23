const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const CheckInLog = require('../models/CheckInLog');
const { apiResponse, paginate } = require('../utils/helpers');
const { logger } = require('../utils/logger');
const blockchainService = require('../services/blockchainService');
const qrCodeService = require('../services/qrCodeService');

const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

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
    const { page = 1, limit = 100 } = req.query;
    const userAddress = req.user.walletAddress.toLowerCase();

    logger.info(`Fetching tickets for user: ${userAddress}`);

    // Get all events to check ticket types
    const events = await Event.find({ isActive: true }).lean();
    const allTickets = [];

    // For each event, check user's ticket balance from blockchain
    for (const event of events) {
      const ticketTypes = await TicketType.find({ eventId: event.eventId }).lean();
      
      for (const ticketType of ticketTypes) {
        try {
          // Get balance from blockchain
          const balance = await blockchainService.getTicketBalance(userAddress, ticketType.tokenId);
          
          // If user owns tickets of this type
          if (balance > 0) {
            // Create individual tickets for each owned ticket
            for (let i = 0; i < balance; i++) {
              // Find ticket record in database
              const tickets = await Ticket.find({
                owner: userAddress,
                ticketTypeId: ticketType.tokenId,
                eventId: event.eventId
              }).lean();

              const ticket = tickets[i] || null;

              // Generate unique QR code for each ticket
              let qrCode = ticket?.qrCode;
              if (!qrCode) {
                const qrResult = await qrCodeService.generateTicketQR({
                  tokenId: ticketType.tokenId,
                  eventId: event.eventId,
                  owner: userAddress,
                  ticketIndex: i, // Add index to make each QR unique
                });
                qrCode = qrResult.qrCode;
                
                // Save QR code to database if ticket exists
                if (ticket) {
                  await Ticket.updateOne({ _id: ticket._id }, { qrCode });
                }
              }

              // Add individual ticket
              allTickets.push({
                _id: ticket?._id || `${ticketType.tokenId}-${i}`,
                tokenId: ticket?.tokenId || `${ticketType.tokenId}-${userAddress}-${i}`,
                eventId: event.eventId,
                ticketTypeId: ticketType.tokenId,
                owner: userAddress,
                ticketTypeName: ticketType.name,
                price: ticketType.price,
                isUsed: ticket?.isUsed || false,
                qrCode,
                ticketNumber: i + 1, // Add ticket number for display
                totalTickets: balance, // Total tickets of this type
                event: {
                  ...event,
                  imageUrl: event.bannerImageIPFS 
                    ? (event.bannerImageIPFS.startsWith('http') 
                      ? event.bannerImageIPFS 
                      : `${IPFS_GATEWAY}${event.bannerImageIPFS}`)
                    : event.bannerImage || null,
                },
                ticketType,
              });
            }
          }
        } catch (error) {
          logger.error(`Error checking balance for ticket type ${ticketType.tokenId}:`, error);
        }
      }
    }

    // Sort by purchase date (newest first)
    allTickets.sort((a, b) => {
      const dateA = a.purchasedAt || a.createdAt || 0;
      const dateB = b.purchasedAt || b.createdAt || 0;
      return new Date(dateB) - new Date(dateA);
    });

    logger.info(`Found ${allTickets.length} unique ticket types for user ${userAddress}`);

    // Paginate results
    const total = allTickets.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = allTickets.slice(startIndex, endIndex);

    res.json(apiResponse(true, 'Tickets retrieved', paginate(paginatedTickets, page, limit, total)));
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
