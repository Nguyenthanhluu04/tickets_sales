const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { apiResponse } = require('../utils/helpers');
const { logger } = require('../utils/logger');
const { ethers } = require('ethers');

/**
 * @desc Get admin dashboard data
 * @route GET /api/admin/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const totalRevenue = await Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toLong: '$revenue' } }
        }
      }
    ]);

    const revenueInEther = totalRevenue.length > 0 
      ? ethers.formatEther(totalRevenue[0].total.toString())
      : '0';

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get top events
    const topEvents = await Event.find()
      .sort({ totalTicketsSold: -1 })
      .limit(5)
      .lean();

    res.json(apiResponse(true, 'Dashboard data retrieved', {
      stats: {
        totalEvents,
        totalTickets,
        totalUsers,
        totalRevenue: revenueInEther,
      },
      recentTransactions,
      topEvents,
    }));
  } catch (error) {
    logger.error('Get dashboard error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get all users (admin)
 * @route GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json(apiResponse(true, 'Users retrieved', {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    }));
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get all transactions
 * @route GET /api/admin/transactions
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json(apiResponse(true, 'Transactions retrieved', {
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    }));
  } catch (error) {
    logger.error('Get all transactions error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};
