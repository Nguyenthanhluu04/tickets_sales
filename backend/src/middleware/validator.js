const { body, param, query, validationResult } = require('express-validator');
const { apiResponse } = require('../utils/helpers');

/**
 * Validate request
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json(
      apiResponse(false, 'Validation failed', null, errors.array())
    );
  }
  
  next();
};

/**
 * Login validation
 */
exports.loginValidation = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isEthereumAddress()
    .withMessage('Invalid Ethereum address'),
  body('signature')
    .notEmpty()
    .withMessage('Signature is required'),
];

/**
 * Event validation
 */
exports.createEventValidation = [
  body('name')
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Event name must be between 3 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Invalid start time format'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('Invalid end time format'),
];

/**
 * Ticket check-in validation
 */
exports.checkInValidation = [
  body('qrData')
    .notEmpty()
    .withMessage('QR data is required'),
];

/**
 * Wallet address param validation
 */
exports.walletAddressValidation = [
  param('address')
    .isEthereumAddress()
    .withMessage('Invalid wallet address'),
];

/**
 * Pagination validation
 */
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
