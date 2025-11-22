const rateLimit = require('express-rate-limit');
const { apiResponse } = require('../utils/helpers');

/**
 * General API rate limiter
 */
exports.apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: apiResponse(false, 'Too many requests, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth routes
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: apiResponse(false, 'Too many login attempts, please try again later'),
  skipSuccessfulRequests: true,
});

/**
 * Ticket purchase rate limiter
 */
exports.purchaseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 purchases per minute
  message: apiResponse(false, 'Too many purchase attempts, please slow down'),
});
