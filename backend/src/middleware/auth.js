const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { apiResponse } = require('../utils/helpers');

/**
 * Protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json(
        apiResponse(false, 'Not authorized to access this route')
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-nonce');
      
      if (!req.user) {
        return res.status(401).json(
          apiResponse(false, 'User not found')
        );
      }

      next();
    } catch (error) {
      return res.status(401).json(
        apiResponse(false, 'Invalid token')
      );
    }
  } catch (error) {
    return res.status(500).json(
      apiResponse(false, 'Server error', null, error.message)
    );
  }
};

/**
 * Grant access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        apiResponse(false, `User role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};

/**
 * Optional auth - attach user if token exists
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-nonce');
      } catch (error) {
        // Token invalid, but continue without user
      }
    }

    next();
  } catch (error) {
    next();
  }
};
