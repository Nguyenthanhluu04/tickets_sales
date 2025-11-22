const { logger } = require('../utils/logger');
const { apiResponse } = require('../utils/helpers');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json(
      apiResponse(false, 'Resource not found', null, 'Invalid ID format')
    );
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json(
      apiResponse(false, 'Duplicate field value', null, `${field} already exists`)
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json(
      apiResponse(false, 'Validation error', null, messages.join(', '))
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      apiResponse(false, 'Invalid token', null, err.message)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      apiResponse(false, 'Token expired', null, 'Please login again')
    );
  }

  // Default error
  res.status(err.statusCode || 500).json(
    apiResponse(
      false,
      err.message || 'Server error',
      null,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    )
  );
};

module.exports = errorHandler;
