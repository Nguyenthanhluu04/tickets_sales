const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { apiResponse } = require('../utils/helpers');
const { logger } = require('../utils/logger');

/**
 * @desc Get user profile
 * @route GET /api/users/:address
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { address } = req.params;

    const user = await User.findOne({ walletAddress: address.toLowerCase() }).lean();
    
    if (!user) {
      return res.status(404).json(apiResponse(false, 'User not found'));
    }

    // Get user stats
    const ticketCount = await Ticket.countDocuments({ owner: address.toLowerCase() });
    const eventCount = await Event.countDocuments({ organizer: address.toLowerCase() });

    res.json(apiResponse(true, 'User profile retrieved', {
      ...user,
      stats: {
        ticketsOwned: ticketCount,
        eventsOrganized: eventCount,
      },
    }));
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/:address
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { address } = req.params;
    const { name, email, bio, avatar } = req.body;

    // Check if user is updating their own profile
    if (address.toLowerCase() !== req.user.walletAddress) {
      return res.status(403).json(apiResponse(false, 'Unauthorized'));
    }

    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    
    if (!user) {
      return res.status(404).json(apiResponse(false, 'User not found'));
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    logger.info(`User profile updated: ${address}`);

    res.json(apiResponse(true, 'Profile updated', user.toJSON()));
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get user's tickets
 * @route GET /api/users/:address/tickets
 */
exports.getUserTickets = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const tickets = await Ticket.find({ owner: address.toLowerCase() })
      .sort({ purchasedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json(apiResponse(true, 'User tickets retrieved', tickets));
  } catch (error) {
    logger.error('Get user tickets error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get user's organized events
 * @route GET /api/users/:address/events
 */
exports.getUserEvents = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const events = await Event.find({ organizer: address.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json(apiResponse(true, 'User events retrieved', events));
  } catch (error) {
    logger.error('Get user events error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};
