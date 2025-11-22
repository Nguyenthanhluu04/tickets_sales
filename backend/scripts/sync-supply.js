/**
 * Script to sync current supply of all ticket types from blockchain
 */

require('dotenv').config();
const mongoose = require('mongoose');
const blockchainConfig = require('../src/config/blockchain');
const TicketType = require('../src/models/TicketType');
const { logger } = require('../src/utils/logger');

async function syncSupply() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-sales');
    logger.info('Connected to MongoDB');

    // Initialize blockchain service
    const blockchainService = require('../src/services/blockchainService');
    try {
      await blockchainService.initialize();
      logger.info('Blockchain service initialized');
    } catch (initError) {
      logger.error('Failed to initialize blockchain service:', initError);
      throw initError;
    }
    
    // Get contract from blockchainService (already initialized)
    const contract = blockchainService.contract;
    if (!contract) {
      logger.error('Contract is null after initialization');
      logger.error('CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS);
      logger.error('AMOY_RPC_URL:', process.env.AMOY_RPC_URL);
      throw new Error('Failed to get contract instance. Check CONTRACT_ADDRESS in .env and network connectivity.');
    }
    logger.info('Connected to blockchain');

    // Get all ticket types
    const ticketTypes = await TicketType.find({});
    logger.info(`Found ${ticketTypes.length} ticket types to sync`);

    let syncedCount = 0;

    for (const ticketType of ticketTypes) {
      try {
        // Instead of totalSupply (which may not exist), count from TicketPurchased events
        const filter = contract.filters.TicketPurchased(ticketType.tokenId);
        const events = await contract.queryFilter(filter, 0);
        
        // Calculate total supply from events
        let currentSupply = 0;
        for (const event of events) {
          currentSupply += Number(event.args.amount);
        }
        
        // Update in database
        ticketType.currentSupply = currentSupply;
        await ticketType.save();
        
        logger.info(`✅ Ticket type ${ticketType.tokenId} (${ticketType.name}): ${currentSupply}/${ticketType.maxSupply} sold`);
        syncedCount++;
      } catch (error) {
        logger.error(`❌ Failed to sync ticket type ${ticketType.tokenId}:`, error.message);
      }
    }

    logger.info(`\n✅ Supply sync completed!`);
    logger.info(`   - Total ticket types: ${ticketTypes.length}`);
    logger.info(`   - Synced: ${syncedCount}`);

  } catch (error) {
    logger.error('Sync failed:', error);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
}

// Run sync
syncSupply();
