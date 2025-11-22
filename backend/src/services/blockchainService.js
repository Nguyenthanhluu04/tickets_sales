const blockchainConfig = require('../config/blockchain');
const { ethers } = require('ethers');
const { logger } = require('../utils/logger');

class BlockchainService {
  constructor() {
    this.contract = null;
    this.provider = null;
  }

  async initialize() {
    // First initialize the blockchain config
    await blockchainConfig.initialize();
    
    // Then get contract and provider
    this.contract = blockchainConfig.getContract();
    this.provider = blockchainConfig.getProvider();
  }

  /**
   * Get event details from blockchain
   */
  async getEventDetails(eventId) {
    try {
      const event = await this.contract.getEvent(eventId);
      return {
        eventId: Number(event.eventId),
        name: event.name,
        description: event.description,
        startTime: Number(event.startTime),
        endTime: Number(event.endTime),
        organizer: event.organizer,
        isActive: event.isActive,
        createdAt: Number(event.createdAt),
      };
    } catch (error) {
      logger.error('Error getting event details:', error);
      throw error;
    }
  }

  /**
   * Get ticket type details
   */
  async getTicketType(tokenId) {
    try {
      const ticketType = await this.contract.getTicketType(tokenId);
      return {
        tokenId: Number(ticketType.tokenId),
        eventId: Number(ticketType.eventId),
        name: ticketType.name,
        price: ticketType.price.toString(),
        maxSupply: Number(ticketType.maxSupply),
        startSaleTime: Number(ticketType.startSaleTime),
        endSaleTime: Number(ticketType.endSaleTime),
        isActive: ticketType.isActive,
      };
    } catch (error) {
      logger.error('Error getting ticket type:', error);
      throw error;
    }
  }

  /**
   * Get event ticket types
   */
  async getEventTicketTypes(eventId) {
    try {
      const tokenIds = await this.contract.getEventTicketTypes(eventId);
      return tokenIds.map(id => Number(id));
    } catch (error) {
      logger.error('Error getting event ticket types:', error);
      throw error;
    }
  }

  /**
   * Check ticket ownership
   */
  async verifyOwnership(tokenId, address) {
    try {
      const balance = await this.contract.balanceOf(address, tokenId);
      return Number(balance) > 0;
    } catch (error) {
      logger.error('Error verifying ownership:', error);
      throw error;
    }
  }

  /**
   * Get ticket balance
   */
  async getTicketBalance(address, tokenId) {
    try {
      const balance = await this.contract.balanceOf(address, tokenId);
      return Number(balance);
    } catch (error) {
      logger.error('Error getting ticket balance:', error);
      throw error;
    }
  }

  /**
   * Get current supply of ticket type
   */
  async getCurrentSupply(tokenId) {
    try {
      // Use explicit function signature to avoid ambiguity
      const supply = await this.contract['totalSupply(uint256)'](tokenId);
      return Number(supply);
    } catch (error) {
      logger.error('Error getting current supply:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash, confirmations = 1) {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      logger.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  /**
   * Get contract balance
   */
  async getContractBalance() {
    try {
      const balance = await this.contract.getBalance();
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Error getting contract balance:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for purchase
   */
  async estimateGas(method, ...args) {
    try {
      const gasEstimate = await this.contract[method].estimateGas(...args);
      return gasEstimate.toString();
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw error;
    }
  }
}

const blockchainService = new BlockchainService();

module.exports = blockchainService;
