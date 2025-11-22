const pinataSDK = require('@pinata/sdk');
const { logger } = require('../utils/logger');

class IPFSConfig {
  constructor() {
    this.pinata = null;
  }

  async initialize() {
    try {
      this.pinata = new pinataSDK(
        process.env.PINATA_API_KEY,
        process.env.PINATA_SECRET_KEY
      );

      // Test authentication
      await this.pinata.testAuthentication();
      
      logger.info('✅ IPFS/Pinata connected successfully');
      return true;
    } catch (error) {
      logger.error('❌ IPFS/Pinata connection failed:', error.message);
      throw error;
    }
  }

  getPinata() {
    return this.pinata;
  }
}

// Singleton instance
const ipfsConfig = new IPFSConfig();

module.exports = ipfsConfig;
