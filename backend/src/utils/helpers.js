const { ethers } = require('ethers');

/**
 * Format wallet address (0x1234...5678)
 */
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Validate Ethereum address
 */
const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

/**
 * Format wei to ether
 */
const formatEther = (wei) => {
  try {
    return ethers.formatEther(wei);
  } catch (error) {
    return '0';
  }
};

/**
 * Parse ether to wei
 */
const parseEther = (ether) => {
  try {
    return ethers.parseEther(ether.toString());
  } catch (error) {
    return BigInt(0);
  }
};

/**
 * Generate random nonce
 */
const generateNonce = () => {
  return Math.floor(Math.random() * 1000000).toString();
};

/**
 * Verify message signature
 */
const verifySignature = (message, signature, expectedAddress) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    return false;
  }
};

/**
 * Create pagination response
 */
const paginate = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

/**
 * API Response formatter
 */
const apiResponse = (success, message, data = null, error = null) => {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Sleep function
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Truncate string
 */
const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

module.exports = {
  formatAddress,
  isValidAddress,
  formatEther,
  parseEther,
  generateNonce,
  verifySignature,
  paginate,
  apiResponse,
  sleep,
  truncate,
};
