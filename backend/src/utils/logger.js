const winston = require('winston');

// Custom filter to exclude "filter not found" errors
const filterNotFoundFilter = winston.format((info) => {
  // Filter out "filter not found" errors from Hardhat node
  if (info.message && typeof info.message === 'string' && 
      info.message.includes('filter not found')) {
    return false;
  }
  if (info.error && info.error.message && 
      info.error.message.includes('filter not found')) {
    return false;
  }
  if (info.code === 'UNKNOWN_ERROR' && info.error?.code === -32000) {
    return false;
  }
  return info;
});

const logFormat = winston.format.combine(
  filterNotFoundFilter(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'nft-ticketing-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      filterNotFoundFilter(),
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

module.exports = { logger };
