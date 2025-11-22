/**
 * Script to sync all ticket purchases from blockchain to database
 * Run this if event listener missed some events or to do initial sync
 */

require('dotenv').config();
const mongoose = require('mongoose');
const blockchainConfig = require('../src/config/blockchain');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const Ticket = require('../src/models/Ticket');
const Transaction = require('../src/models/Transaction');
const { logger } = require('../src/utils/logger');

async function syncTickets() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-sales');
    logger.info('Connected to MongoDB');

    // Initialize blockchain service
    const blockchainService = require('../src/services/blockchainService');
    await blockchainService.initialize();
    
    // Get contract from blockchainService (already initialized)
    const contract = blockchainService.contract;
    if (!contract) {
      throw new Error('Failed to get contract instance. Check CONTRACT_ADDRESS in .env and network connectivity.');
    }
    logger.info('Connected to blockchain');

    // Get all TicketPurchased events
    logger.info('Fetching TicketPurchased events from blockchain...');
    const filter = contract.filters.TicketPurchased();
    const events = await contract.queryFilter(filter, 0);
    
    logger.info(`Found ${events.length} TicketPurchased events`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      const { tokenId, eventId, buyer, amount, price } = event.args;
      const txHash = event.transactionHash;

      // Check if transaction already synced
      const existingTx = await Transaction.findOne({ transactionHash: txHash });
      if (existingTx) {
        logger.info(`Transaction ${txHash} already synced, skipping...`);
        skippedCount++;
        continue;
      }

      // Get ticket type
      const ticketType = await TicketType.findOne({ tokenId: Number(tokenId) });
      if (!ticketType) {
        logger.warn(`Ticket type ${tokenId} not found, skipping...`);
        skippedCount++;
        continue;
      }

      // Get event data
      const eventData = await Event.findOne({ eventId: Number(eventId) });
      if (!eventData) {
        logger.warn(`Event ${eventId} not found, skipping...`);
        skippedCount++;
        continue;
      }

      const purchaseAmount = Number(amount);
      
      // Create individual ticket records for each ticket purchased
      const ticketsToCreate = [];
      for (let i = 0; i < purchaseAmount; i++) {
        const uniqueTicketId = `${tokenId}-${buyer.toLowerCase()}-${event.blockNumber}-${i}`;
        
        // Check if ticket already exists
        const existingTicket = await Ticket.findOne({ tokenId: uniqueTicketId });
        if (!existingTicket) {
          ticketsToCreate.push({
            tokenId: uniqueTicketId,
            eventId: Number(eventId),
            ticketTypeId: Number(tokenId),
            owner: buyer.toLowerCase(),
            ticketTypeName: ticketType.name,
            price: ticketType.price,
            transactionHash: txHash,
            isUsed: false,
          });
        }
      }

      if (ticketsToCreate.length > 0) {
        // Bulk insert tickets
        await Ticket.insertMany(ticketsToCreate);
        logger.info(`Created ${ticketsToCreate.length} ticket records for tx ${txHash}`);
      }

      // Update ticket type supply
      const currentSupply = await contract.totalSupply(tokenId);
      ticketType.currentSupply = Number(currentSupply);
      await ticketType.save();

      // Update event stats
      const totalSold = await Ticket.countDocuments({ eventId: Number(eventId) });
      eventData.totalTicketsSold = totalSold;
      
      // Calculate revenue
      const allEventTickets = await Ticket.find({ eventId: Number(eventId) });
      let totalRevenue = BigInt(0);
      for (const ticket of allEventTickets) {
        totalRevenue += BigInt(ticket.price);
      }
      eventData.revenue = totalRevenue.toString();
      await eventData.save();

      // Save transaction
      await Transaction.create({
        transactionHash: txHash,
        from: buyer.toLowerCase(),
        to: event.address,
        eventId: Number(eventId),
        ticketTypeId: Number(tokenId),
        tokenId: ticketsToCreate.map(t => t.tokenId).join(','),
        type: 'purchase',
        amount: (BigInt(ticketType.price) * BigInt(purchaseAmount)).toString(),
        quantity: purchaseAmount,
        status: 'confirmed',
      });

      syncedCount++;
      logger.info(`Synced transaction ${txHash} (${syncedCount}/${events.length})`);
    }

    logger.info(`\n✅ Sync completed!`);
    logger.info(`   - Total events: ${events.length}`);
    logger.info(`   - Synced: ${syncedCount}`);
    logger.info(`   - Skipped: ${skippedCount}`);

  } catch (error) {
    logger.error('Sync failed:', error);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
}

// Run sync
syncTickets();
