/**
 * Script to sync totalTicketsSold for all events from blockchain
 * This ensures the database is accurate with blockchain data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const blockchainService = require('../src/services/blockchainService');
const { logger } = require('../src/utils/logger');

async function syncTotalTicketsSold() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');

    // Initialize blockchain service
    await blockchainService.initialize();
    logger.info('✅ Blockchain service initialized');

    // Get all events
    const events = await Event.find({});
    logger.info(`Found ${events.length} events to sync`);

    for (const event of events) {
      try {
        logger.info(`\n📊 Processing Event ${event.eventId}: ${event.name}`);

        // Get all ticket types for this event
        const ticketTypes = await TicketType.find({ eventId: event.eventId });
        logger.info(`  Found ${ticketTypes.length} ticket types`);

        let totalSold = 0;
        let totalRevenue = BigInt(0);

        // Sum up current supply from blockchain for all ticket types
        for (const ticketType of ticketTypes) {
          try {
            const currentSupply = await blockchainService.getCurrentSupply(ticketType.tokenId);
            logger.info(`    Ticket Type ${ticketType.tokenId} (${ticketType.name}): ${currentSupply} sold`);
            
            totalSold += currentSupply;
            
            // Calculate revenue for this ticket type
            const ticketRevenue = BigInt(ticketType.price) * BigInt(currentSupply);
            totalRevenue += ticketRevenue;

            // Update ticket type current supply
            if (ticketType.currentSupply !== currentSupply) {
              ticketType.currentSupply = currentSupply;
              await ticketType.save();
              logger.info(`    ✅ Updated currentSupply for ticket type ${ticketType.tokenId}`);
            }
          } catch (error) {
            logger.error(`    ❌ Error getting supply for ticket type ${ticketType.tokenId}:`, error.message);
          }
        }

        // Update event with correct totals
        const updated = await Event.findByIdAndUpdate(
          event._id,
          {
            totalTicketsSold: totalSold,
            revenue: totalRevenue.toString(),
          },
          { new: true }
        );

        logger.info(`  ✅ Event ${event.eventId} updated:`);
        logger.info(`     - Total tickets sold: ${updated.totalTicketsSold}`);
        logger.info(`     - Revenue: ${updated.revenue} wei`);

      } catch (error) {
        logger.error(`  ❌ Error processing event ${event.eventId}:`, error);
      }
    }

    logger.info('\n✅ Sync completed!');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncTotalTicketsSold();
