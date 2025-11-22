const Event = require('../models/Event');
const TicketType = require('../models/TicketType');
const { apiResponse, paginate } = require('../utils/helpers');
const { logger } = require('../utils/logger');
const blockchainService = require('../services/blockchainService');

/**
 * @desc Get all events
 * @route GET /api/events
 */
exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, isActive = 'true' } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (isActive) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json(apiResponse(true, 'Events retrieved', paginate(events, page, limit, total)));
  } catch (error) {
    logger.error('Get all events error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get event by ID
 * @route GET /api/events/:id
 */
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ eventId: id }).lean();
    
    if (!event) {
      return res.status(404).json(apiResponse(false, 'Event not found'));
    }

    // Get ticket types
    const ticketTypes = await TicketType.find({ eventId: id, isActive: true }).lean();

    res.json(apiResponse(true, 'Event retrieved', {
      ...event,
      ticketTypes,
    }));
  } catch (error) {
    logger.error('Get event error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Create event
 * @route POST /api/events
 */
exports.createEvent = async (req, res) => {
  try {
    const { name, description, location, venue, startTime, endTime, category, bannerImage } = req.body;

    // Validation
    if (!name || !description || !startTime || !endTime) {
      return res.status(400).json(apiResponse(false, 'Missing required fields'));
    }

    // This endpoint expects the event to already be created on blockchain
    // and we're just saving additional metadata
    // For actual blockchain creation, use frontend + smart contract directly

    res.json(apiResponse(true, 'Event creation initiated', {
      message: 'Create event on blockchain first, then sync to backend'
    }));
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get event statistics
 * @route GET /api/events/:id/stats
 */
exports.getEventStats = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ eventId: id });
    
    if (!event) {
      return res.status(404).json(apiResponse(false, 'Event not found'));
    }

    const ticketTypes = await TicketType.find({ eventId: id });
    
    const stats = {
      totalTicketsSold: event.totalTicketsSold,
      revenue: event.revenue,
      ticketTypes: ticketTypes.map(tt => ({
        name: tt.name,
        sold: tt.currentSupply,
        remaining: tt.maxSupply - tt.currentSupply,
        revenue: (BigInt(tt.price) * BigInt(tt.currentSupply)).toString(),
      })),
    };

    res.json(apiResponse(true, 'Stats retrieved', stats));
  } catch (error) {
    logger.error('Get event stats error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Sync event from blockchain to database
 * @route POST /api/events/sync
 */
exports.syncEventFromBlockchain = async (req, res) => {
  try {
    const { eventId, name, description, startTime, endTime, organizer, isActive, totalTicketsSold, revenue } = req.body;

    // Check if event already exists
    let event = await Event.findOne({ eventId });

    if (event) {
      // Update existing event
      event.name = name;
      event.description = description;
      event.startTime = startTime;
      event.endTime = endTime;
      event.organizer = organizer.toLowerCase();
      event.isActive = isActive;
      event.totalTicketsSold = totalTicketsSold || 0;
      event.revenue = revenue || '0';
      await event.save();

      logger.info(`Event ${eventId} updated from blockchain`);
      return res.json(apiResponse(true, 'Event updated', event));
    }

    // Create new event
    event = await Event.create({
      eventId,
      name,
      description,
      startTime,
      endTime,
      organizer: organizer.toLowerCase(),
      isActive,
      totalTicketsSold: totalTicketsSold || 0,
      revenue: revenue || '0',
    });

    logger.info(`Event ${eventId} synced from blockchain`);
    res.status(201).json(apiResponse(true, 'Event synced successfully', event));
  } catch (error) {
    logger.error('Sync event error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Sync ticket type from blockchain to database
 * @route POST /api/events/:id/ticket-types/sync
 */
exports.syncTicketTypeFromBlockchain = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { tokenId, name, price, maxSupply, currentSupply, saleStartTime, saleEndTime, isActive } = req.body;

    // Check if event exists
    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json(apiResponse(false, 'Event not found'));
    }

    // Check if ticket type already exists
    let ticketType = await TicketType.findOne({ tokenId });

    if (ticketType) {
      // Update existing ticket type
      ticketType.name = name;
      ticketType.price = price;
      ticketType.maxSupply = maxSupply;
      ticketType.currentSupply = currentSupply || 0;
      ticketType.saleStartTime = saleStartTime;
      ticketType.saleEndTime = saleEndTime;
      ticketType.isActive = isActive;
      await ticketType.save();

      logger.info(`Ticket type ${tokenId} updated from blockchain`);
      return res.json(apiResponse(true, 'Ticket type updated', ticketType));
    }

    // Create new ticket type
    ticketType = await TicketType.create({
      tokenId,
      eventId,
      name,
      price,
      maxSupply,
      currentSupply: currentSupply || 0,
      saleStartTime,
      saleEndTime,
      isActive,
    });

    logger.info(`Ticket type ${tokenId} synced from blockchain`);
    res.status(201).json(apiResponse(true, 'Ticket type synced successfully', ticketType));
  } catch (error) {
    logger.error('Sync ticket type error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};
