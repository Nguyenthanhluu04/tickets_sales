require('dotenv').config();

// Suppress ethers.js console errors for "filter not found"
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  if (message.includes('@TODO Error:') && 
      message.includes('filter not found')) {
    return; // Silently ignore
  }
  originalConsoleLog.apply(console, args);
};

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const blockchainConfig = require('./config/blockchain');
const ipfsConfig = require('./config/ipfs');
const blockchainService = require('./services/blockchainService');
const ipfsService = require('./services/ipfsService');
const emailService = require('./services/emailService');
const eventListenerService = require('./services/eventListenerService');
const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Initialize services and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize blockchain connection
    try {
      const blockchainReady = await blockchainConfig.initialize();
      if (blockchainReady) {
        await blockchainService.initialize();
      }
    } catch (error) {
      logger.warn('⚠️  Blockchain initialization failed, continuing without blockchain:', error.message);
    }

    // Initialize IPFS
    try {
      await ipfsConfig.initialize();
      await ipfsService.initialize();
    } catch (error) {
      logger.warn('IPFS initialization failed, continuing without IPFS:', error.message);
    }

    // Initialize email service
    try {
      await emailService.initialize();
    } catch (error) {
      logger.warn('Email service initialization failed, continuing without email:', error.message);
    }

    // Start blockchain event listener
    try {
      if (process.env.ENABLE_EVENT_LISTENER !== 'false') {
        await eventListenerService.initialize();
        await eventListenerService.startListening();
      } else {
        logger.info('⏸️  Event listener disabled (ENABLE_EVENT_LISTENER=false)');
      }
    } catch (error) {
      logger.error('Event listener failed to start:', error.message);
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📡 API: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      eventListenerService.stopListening();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      eventListenerService.stopListening();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    // Global error handlers
    process.on('unhandledRejection', (reason, promise) => {
      // Ignore filter not found errors from public RPC nodes
      if (reason?.error?.message?.includes('filter not found') ||
          reason?.message?.includes('filter not found') ||
          reason?.shortMessage?.includes('filter not found') ||
          (reason?.code === 'UNKNOWN_ERROR' && reason?.error?.code === -32000)) {
        return;
      }
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      // Ignore filter not found errors from public RPC nodes
      if (error?.message?.includes('filter not found') ||
          error?.shortMessage?.includes('filter not found') ||
          (error?.code === 'UNKNOWN_ERROR' && error?.error?.code === -32000) ||
          (error?.code === 'UNKNOWN_ERROR' && error?.error?.message === 'filter not found')) {
        return;
      }
      logger.error('Uncaught Exception:', error);
      // Don't exit on non-critical errors
      if (error.code !== 'UNKNOWN_ERROR') {
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
