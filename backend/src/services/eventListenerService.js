const blockchainConfig = require('../config/blockchain');
const { logger } = require('../utils/logger');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const Transaction = require('../models/Transaction');
const { ethers } = require('ethers');

class EventListenerService {
  constructor() {
    this.contract = null;
    this.isListening = false;
    this.listeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async initialize() {
    this.contract = blockchainConfig.getContract();
    
    // Setup provider error handling
    const provider = blockchainConfig.getProvider();
    if (provider) {
      // Suppress filter not found errors (common with Hardhat node)
      provider.on('error', (error) => {
        if (error?.error?.message?.includes('filter not found')) {
          // Silently ignore filter not found errors
          return;
        }
        logger.error('Provider error:', error);
      });
    }
  }

  /**
   * Start listening to contract events
   */
  async startListening() {
    if (this.isListening) {
      logger.warn('Event listener already running');
      return;
    }

    try {
      // Use polling instead of filters for Hardhat compatibility
      // Listen to EventCreated
      const eventCreatedListener = async (eventId, name, organizer, startTime, endTime, event) => {
        try {
          await this.handleEventCreated(eventId, name, organizer, startTime, endTime, event);
        } catch (error) {
          if (!error?.message?.includes('filter not found')) {
            logger.error('Error in EventCreated listener:', error);
          }
        }
      };
      this.contract.on('EventCreated', eventCreatedListener);
      this.listeners.push({ event: 'EventCreated', listener: eventCreatedListener });

      // Listen to TicketTypeCreated
      const ticketTypeCreatedListener = async (tokenId, eventId, name, price, maxSupply, event) => {
        try {
          await this.handleTicketTypeCreated(tokenId, eventId, name, price, maxSupply, event);
        } catch (error) {
          if (!error?.message?.includes('filter not found')) {
            logger.error('Error in TicketTypeCreated listener:', error);
          }
        }
      };
      this.contract.on('TicketTypeCreated', ticketTypeCreatedListener);
      this.listeners.push({ event: 'TicketTypeCreated', listener: ticketTypeCreatedListener });

      // Listen to TicketPurchased
      const ticketPurchasedListener = async (tokenId, eventId, buyer, amount, price, event) => {
        try {
          await this.handleTicketPurchased(tokenId, eventId, buyer, amount, price, event);
        } catch (error) {
          if (!error?.message?.includes('filter not found')) {
            logger.error('Error in TicketPurchased listener:', error);
          }
        }
      };
      this.contract.on('TicketPurchased', ticketPurchasedListener);
      this.listeners.push({ event: 'TicketPurchased', listener: ticketPurchasedListener });

      // Listen to TicketCheckedIn
      const ticketCheckedInListener = async (tokenId, eventId, holder, timestamp, event) => {
        try {
          await this.handleTicketCheckedIn(tokenId, eventId, holder, timestamp, event);
        } catch (error) {
          if (!error?.message?.includes('filter not found')) {
            logger.error('Error in TicketCheckedIn listener:', error);
          }
        }
      };
      this.contract.on('TicketCheckedIn', ticketCheckedInListener);
      this.listeners.push({ event: 'TicketCheckedIn', listener: ticketCheckedInListener });

      this.isListening = true;
      logger.info('🎧 Blockchain event listener started');
    } catch (error) {
      logger.error('Error starting event listener:', error);
      throw error;
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.contract) {
      this.contract.removeAllListeners();
      this.listeners = [];
      this.isListening = false;
      logger.info('Event listener stopped');
    }
  }

  /**
   * Handle EventCreated event
   */
  async handleEventCreated(eventId, name, organizer, startTime, endTime, event) {
    try {
      logger.info(`Event created: ${name} (ID: ${eventId})`);

      // Check if event already exists
      const existingEvent = await Event.findOne({ eventId: Number(eventId) });
      if (existingEvent) {
        logger.warn(`Event ${eventId} already exists in database`);
        return;
      }

      // Create event in database
      await Event.create({
        eventId: Number(eventId),
        name,
        organizer: organizer.toLowerCase(),
        startTime: new Date(Number(startTime) * 1000),
        endTime: new Date(Number(endTime) * 1000),
        transactionHash: event.log.transactionHash,
        isActive: true,
      });

      // Save transaction
      await this.saveTransaction({
        transactionHash: event.log.transactionHash,
        from: organizer.toLowerCase(),
        eventId: Number(eventId),
        type: 'event_creation',
        amount: '0',
      });

      logger.info(`Event ${eventId} saved to database`);
    } catch (error) {
      logger.error('Error handling EventCreated:', error);
    }
  }

  /**
   * Handle TicketTypeCreated event
   */
  async handleTicketTypeCreated(tokenId, eventId, name, price, maxSupply, event) {
    try {
      logger.info(`Ticket type created: ${name} (Token ID: ${tokenId})`);

      // Check if ticket type already exists
      const existingTicketType = await TicketType.findOne({ tokenId: Number(tokenId) });
      if (existingTicketType) {
        logger.warn(`Ticket type ${tokenId} already exists in database`);
        return;
      }

      // Get full ticket type data from contract
      const ticketTypeData = await this.contract.getTicketType(tokenId);

      await TicketType.create({
        tokenId: Number(tokenId),
        eventId: Number(eventId),
        name,
        price: price.toString(),
        maxSupply: Number(maxSupply),
        currentSupply: 0,
        startSaleTime: new Date(Number(ticketTypeData.startSaleTime) * 1000),
        endSaleTime: new Date(Number(ticketTypeData.endSaleTime) * 1000),
        transactionHash: event.log.transactionHash,
        isActive: true,
      });

      // Save transaction
      await this.saveTransaction({
        transactionHash: event.log.transactionHash,
        from: event.log.address,
        eventId: Number(eventId),
        ticketTypeId: Number(tokenId),
        type: 'ticket_type_creation',
        amount: '0',
      });

      logger.info(`Ticket type ${tokenId} saved to database`);
    } catch (error) {
      logger.error('Error handling TicketTypeCreated:', error);
    }
  }

  /**
   * Handle TicketPurchased event
   */
  async handleTicketPurchased(tokenId, eventId, buyer, amount, price, event) {
    try {
      logger.info(`Ticket purchased: Token ${tokenId} by ${buyer}`);

      // Get ticket type
      const ticketType = await TicketType.findOne({ tokenId: Number(tokenId) });
      if (!ticketType) {
        logger.error(`Ticket type ${tokenId} not found`);
        return;
      }

      // Get event
      const eventData = await Event.findOne({ eventId: Number(eventId) });

      // Create ticket record
      const ticket = await Ticket.create({
        tokenId: `${tokenId}-${buyer.toLowerCase()}`,
        eventId: Number(eventId),
        ticketTypeId: Number(tokenId),
        owner: buyer.toLowerCase(),
        ticketTypeName: ticketType.name,
        price: price.toString(),
        transactionHash: event.log.transactionHash,
        isUsed: false,
      });

      // Update ticket type supply
      ticketType.currentSupply += Number(amount);
      await ticketType.save();

      // Update event stats
      if (eventData) {
        eventData.totalTicketsSold += Number(amount);
        const currentRevenue = BigInt(eventData.revenue || '0');
        const newRevenue = currentRevenue + price;
        eventData.revenue = newRevenue.toString();
        await eventData.save();
      }

      // Save transaction
      await this.saveTransaction({
        transactionHash: event.log.transactionHash,
        from: buyer.toLowerCase(),
        to: event.log.address,
        eventId: Number(eventId),
        ticketTypeId: Number(tokenId),
        tokenId: ticket.tokenId,
        type: 'purchase',
        amount: price.toString(),
        quantity: Number(amount),
      });

      logger.info(`Ticket ${ticket.tokenId} saved to database`);
    } catch (error) {
      logger.error('Error handling TicketPurchased:', error);
    }
  }

  /**
   * Handle TicketCheckedIn event
   */
  async handleTicketCheckedIn(tokenId, eventId, holder, timestamp, event) {
    try {
      logger.info(`Ticket checked in: Token ${tokenId} by ${holder}`);

      // Update ticket
      await Ticket.updateOne(
        { tokenId: `${tokenId}-${holder.toLowerCase()}` },
        {
          isUsed: true,
          checkedInAt: new Date(Number(timestamp) * 1000),
        }
      );

      logger.info(`Ticket ${tokenId} marked as used`);
    } catch (error) {
      logger.error('Error handling TicketCheckedIn:', error);
    }
  }

  /**
   * Save transaction to database
   */
  async saveTransaction(txData) {
    try {
      const existingTx = await Transaction.findOne({ transactionHash: txData.transactionHash });
      if (existingTx) {
        return;
      }

      await Transaction.create({
        ...txData,
        status: 'confirmed',
      });
    } catch (error) {
      logger.error('Error saving transaction:', error);
    }
  }

  /**
   * Sync past events (for initial setup)
   */
  async syncPastEvents(fromBlock = 0) {
    try {
      logger.info('Syncing past events...');

      const filter = this.contract.filters.TicketPurchased();
      const events = await this.contract.queryFilter(filter, fromBlock);

      for (const event of events) {
        const { tokenId, eventId, buyer, amount, price } = event.args;
        await this.handleTicketPurchased(tokenId, eventId, buyer, amount, price, event);
      }

      logger.info(`Synced ${events.length} past events`);
    } catch (error) {
      logger.error('Error syncing past events:', error);
    }
  }
}

const eventListenerService = new EventListenerService();

module.exports = eventListenerService;
