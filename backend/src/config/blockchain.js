const { ethers } = require('ethers');
const { logger } = require('../utils/logger');

// Import contract ABI (will be generated after blockchain deployment)
const CONTRACT_ABI = require('./contractABI.json');

class BlockchainConfig {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.wallet = null;
  }

  async initialize() {
    try {
      // Setup provider - support both Amoy (80002) and Polygon (137)
      const rpcUrl = process.env.CHAIN_ID === '137' 
        ? process.env.POLYGON_RPC_URL 
        : process.env.AMOY_RPC_URL;

      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Suppress common filter not found errors from Hardhat node
      this.provider._events = {};
      this.provider.on('error', (error) => {
        // Silently ignore filter not found errors (common with Hardhat local node)
        if (error?.error?.message?.includes('filter not found') || 
            error?.message?.includes('filter not found') ||
            error?.code === 'UNKNOWN_ERROR') {
          return;
        }
        logger.error('Provider error:', error);
      });

      // Setup wallet (for backend-controlled transactions)
      if (process.env.BACKEND_WALLET_PRIVATE_KEY && process.env.BACKEND_WALLET_PRIVATE_KEY.length === 64) {
        this.wallet = new ethers.Wallet(
          process.env.BACKEND_WALLET_PRIVATE_KEY,
          this.provider
        );
        logger.info(`🔑 Backend wallet: ${this.wallet.address}`);
      } else {
        logger.warn('⚠️  No backend wallet configured - read-only mode');
      }

      // Setup contract
      if (!process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS.includes('your_')) {
        logger.warn('⚠️  Contract address not configured - blockchain features disabled');
        return false;
      }

      this.contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        CONTRACT_ABI.abi,
        this.wallet || this.provider
      );

      // Verify contract
      const code = await this.provider.getCode(process.env.CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error('Contract not found at specified address');
      }

      logger.info(`✅ Blockchain connected: ${rpcUrl}`);
      logger.info(`📄 Contract address: ${process.env.CONTRACT_ADDRESS}`);

      // Get network info
      const network = await this.provider.getNetwork();
      logger.info(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

      return true;
    } catch (error) {
      logger.error('❌ Blockchain connection failed:', error.message);
      throw error;
    }
  }

  getProvider() {
    return this.provider;
  }

  getContract() {
    return this.contract;
  }

  getWallet() {
    return this.wallet;
  }

  // Get contract with specific signer
  getContractWithSigner(signer) {
    return this.contract.connect(signer);
  }
}

// Singleton instance
const blockchainConfig = new BlockchainConfig();

module.exports = blockchainConfig;
