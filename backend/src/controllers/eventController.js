const Event = require('../models/Event');
const TicketType = require('../models/TicketType');
const { apiResponse, paginate } = require('../utils/helpers');
const { logger } = require('../utils/logger');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');

const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

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

    // Add imageUrl and ticketTypes to each event
    const eventsWithDetails = await Promise.all(events.map(async (event) => {
      const ticketTypes = await TicketType.find({ eventId: event.eventId, isActive: true }).lean();
      
      // Generate full IPFS URL if bannerImageIPFS exists
      let imageUrl = event.bannerImage || null;
      if (event.bannerImageIPFS) {
        imageUrl = event.bannerImageIPFS.startsWith('http') 
          ? event.bannerImageIPFS 
          : `${IPFS_GATEWAY}${event.bannerImageIPFS}`;
      }
      
      return {
        ...event,
        imageUrl,
        ticketTypes: ticketTypes
      };
    }));

    res.json(apiResponse(true, 'Events retrieved', paginate(eventsWithDetails, page, limit, total)));
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

    // Get current supply from blockchain for each ticket type
    try {
      for (let i = 0; i < ticketTypes.length; i++) {
        const currentSupply = await blockchainService.getCurrentSupply(ticketTypes[i].tokenId);
        ticketTypes[i].currentSupply = currentSupply;
        
        // Update in database
        await TicketType.updateOne(
          { tokenId: ticketTypes[i].tokenId },
          { currentSupply }
        );
      }
    } catch (blockchainError) {
      logger.warn('Failed to get current supply from blockchain:', blockchainError);
      // Use database value if blockchain fails
    }

    // Generate full IPFS URL if bannerImageIPFS exists
    let imageUrl = event.bannerImage || null;
    if (event.bannerImageIPFS) {
      imageUrl = event.bannerImageIPFS.startsWith('http') 
        ? event.bannerImageIPFS 
        : `${IPFS_GATEWAY}${event.bannerImageIPFS}`;
    }
    
    // Add imageUrl field (use bannerImageIPFS if available, otherwise bannerImage)
    const eventWithImage = {
      ...event,
      imageUrl,
      ticketTypes,
    };

    res.json(apiResponse(true, 'Event retrieved', eventWithImage));
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
    const { 
      eventId, 
      name, 
      description, 
      startTime, 
      endTime, 
      organizer, 
      isActive, 
      totalTicketsSold, 
      revenue,
      category,
      location,
      bannerImage 
    } = req.body;

    // Convert Unix timestamps (seconds) to Date objects
    // startTime and endTime from blockchain are in seconds, need to convert to milliseconds
    const startTimeDate = new Date(startTime * 1000);
    const endTimeDate = new Date(endTime * 1000);

    logger.info(`Syncing event ${eventId}: startTime=${startTime} (${startTimeDate.toISOString()}), endTime=${endTime} (${endTimeDate.toISOString()})`);

    // Check if event already exists
    let event = await Event.findOne({ eventId });

    if (event) {
      // Update existing event
      event.name = name;
      event.description = description;
      event.startTime = startTimeDate;
      event.endTime = endTimeDate;
      event.organizer = organizer.toLowerCase();
      event.isActive = isActive;
      event.totalTicketsSold = totalTicketsSold || 0;
      event.revenue = revenue || '0';
      if (category) event.category = category;
      if (location) event.location = location;
      if (bannerImage) event.bannerImage = bannerImage;
      await event.save();

      logger.info(`Event ${eventId} updated from blockchain`);
      return res.json(apiResponse(true, 'Event updated', event));
    }

    // Create new event
    event = await Event.create({
      eventId,
      name,
      description,
      startTime: startTimeDate,
      endTime: endTimeDate,
      organizer: organizer.toLowerCase(),
      isActive,
      totalTicketsSold: totalTicketsSold || 0,
      revenue: revenue || '0',
      category: category || 'other',
      location: location || '',
      bannerImage: bannerImage || ''
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
    const { 
      tokenId, 
      name, 
      price, 
      maxSupply, 
      currentSupply, 
      saleStartTime, 
      saleEndTime, 
      startSaleTime,
      endSaleTime,
      isActive 
    } = req.body;

    // Support both naming conventions
    const actualStartSaleTime = saleStartTime || startSaleTime;
    const actualEndSaleTime = saleEndTime || endSaleTime;

    // Convert Unix timestamps (seconds) to Date objects
    const startSaleTimeDate = new Date(actualStartSaleTime * 1000);
    const endSaleTimeDate = new Date(actualEndSaleTime * 1000);

    logger.info(`Syncing ticket type ${tokenId}: startSaleTime=${actualStartSaleTime} (${startSaleTimeDate.toISOString()}), endSaleTime=${actualEndSaleTime} (${endSaleTimeDate.toISOString()})`);

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
      ticketType.startSaleTime = startSaleTimeDate;
      ticketType.endSaleTime = endSaleTimeDate;
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
      startSaleTime: startSaleTimeDate,
      endSaleTime: endSaleTimeDate,
      isActive,
    });

    logger.info(`Ticket type ${tokenId} synced from blockchain`);
    res.status(201).json(apiResponse(true, 'Ticket type synced successfully', ticketType));
  } catch (error) {
    logger.error('Sync ticket type error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Toggle event active status
 * @route PATCH /api/events/:id/toggle-status
 */
exports.toggleEventStatus = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    // Find event
    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json(apiResponse(false, 'Event not found'));
    }

    // Check if user is organizer or admin
    if (req.user.role !== 'admin' && event.organizer.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json(apiResponse(false, 'Not authorized to toggle this event'));
    }

    // Toggle status
    event.isActive = !event.isActive;
    await event.save();

    logger.info(`Event ${eventId} status toggled to ${event.isActive} by ${req.user.walletAddress}`);

    res.json(apiResponse(true, `Event ${event.isActive ? 'activated' : 'deactivated'} successfully`, event));
  } catch (error) {
    logger.error('Toggle event status error:', error);
    res.status(500).json(apiResponse(false, 'Failed to toggle event status', null, error.message));
  }
};

/**
 * @desc Upload event banner to IPFS
 * @route POST /api/events/:id/upload-banner
 */
exports.uploadEventBanner = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { imageUrl } = req.body;

    logger.info(`Upload banner request for event ${eventId}: ${imageUrl}`);

    if (!imageUrl) {
      return res.status(400).json(apiResponse(false, 'Image URL is required'));
    }

    // Find event
    const event = await Event.findOne({ eventId });
    if (!event) {
      logger.warn(`Event ${eventId} not found`);
      return res.status(404).json(apiResponse(false, 'Event not found'));
    }

    // Check if user is organizer or admin
    if (req.user.role !== 'admin' && event.organizer.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      logger.warn(`Unauthorized upload attempt by ${req.user.walletAddress} for event ${eventId}`);
      return res.status(403).json(apiResponse(false, 'Not authorized to upload banner for this event'));
    }

    // Initialize IPFS service if not already
    if (!ipfsService.pinata) {
      logger.info('Initializing IPFS service...');
      await ipfsService.initialize();
    }

    logger.info(`Uploading image to Pinata from URL: ${imageUrl}`);

    // Upload to IPFS/Pinata
    const fileName = `event-${eventId}-banner.jpg`;
    const result = await ipfsService.uploadImageFromURL(imageUrl, fileName);

    logger.info(`Image uploaded to Pinata. IPFS Hash: ${result.ipfsHash}`);

    // Update event with IPFS hash
    event.bannerImageIPFS = result.ipfsHash;
    event.bannerImage = result.url;
    await event.save();

    logger.info(`Event ${eventId} banner uploaded to IPFS: ${result.ipfsHash}`);

    res.json(apiResponse(true, 'Banner uploaded to IPFS successfully', {
      ipfsHash: result.ipfsHash,
      ipfsUrl: result.url,
      event
    }));
  } catch (error) {
    logger.error('Upload event banner error:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json(apiResponse(false, 'Failed to upload banner', null, error.message));
  }
};
