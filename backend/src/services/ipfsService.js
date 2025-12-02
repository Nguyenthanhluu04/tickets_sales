const ipfsConfig = require('../config/ipfs');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class IPFSService {
  constructor() {
    this.pinata = null;
  }

  async initialize() {
    this.pinata = ipfsConfig.getPinata();
  }

  /**
   * Upload image to IPFS
   */
  async uploadImage(filePath, fileName) {
    try {
      const readableStream = fs.createReadStream(filePath);
      
      const options = {
        pinataMetadata: {
          name: fileName,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      const result = await this.pinata.pinFileToIPFS(readableStream, options);
      
      logger.info(`Image uploaded to IPFS: ${result.IpfsHash}`);
      
      return {
        ipfsHash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      };
    } catch (error) {
      logger.error('Error uploading image to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload image from URL to IPFS
   */
  async uploadImageFromURL(imageUrl, fileName) {
    try {
      logger.info(`Starting upload from URL: ${imageUrl}`);
      
      const axios = require('axios');
      const { Readable } = require('stream');
      
      const response = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB max
      });
      
      logger.info(`Image downloaded, size: ${response.data.byteLength} bytes`);
      
      // Convert buffer to readable stream
      const buffer = Buffer.from(response.data);
      const readableStream = Readable.from(buffer);
      
      const options = {
        pinataMetadata: {
          name: fileName,
          keyvalues: {
            uploadedAt: new Date().toISOString(),
            source: 'event-banner'
          }
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      logger.info('Uploading to Pinata...');
      const result = await this.pinata.pinFileToIPFS(readableStream, options);
      
      logger.info(`✅ Image uploaded to IPFS successfully! Hash: ${result.IpfsHash}`);
      
      return {
        ipfsHash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      };
    } catch (error) {
      logger.error('❌ Error uploading image from URL to IPFS:', error.message);
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Upload image from buffer to IPFS
   */
  async uploadImageFromBuffer(buffer, fileName) {
    try {
      const options = {
        pinataMetadata: {
          name: fileName,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      const result = await this.pinata.pinFileToIPFS(buffer, options);
      
      logger.info(`Image uploaded to IPFS from buffer: ${result.IpfsHash}`);
      
      return {
        ipfsHash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      };
    } catch (error) {
      logger.error('Error uploading image from buffer to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadMetadata(metadata, name) {
    try {
      const options = {
        pinataMetadata: {
          name: name || 'metadata.json',
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      const result = await this.pinata.pinJSONToIPFS(metadata, options);
      
      logger.info(`Metadata uploaded to IPFS: ${result.IpfsHash}`);
      
      return {
        ipfsHash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      };
    } catch (error) {
      logger.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Generate ticket NFT metadata
   */
  async generateTicketMetadata(ticketData) {
    const metadata = {
      name: `${ticketData.eventName} - ${ticketData.ticketTypeName}`,
      description: `Ticket for ${ticketData.eventName}`,
      image: ticketData.bannerImageIPFS || '',
      external_url: `${process.env.FRONTEND_URL}/tickets/${ticketData.tokenId}`,
      attributes: [
        {
          trait_type: 'Event',
          value: ticketData.eventName,
        },
        {
          trait_type: 'Ticket Type',
          value: ticketData.ticketTypeName,
        },
        {
          trait_type: 'Event Date',
          display_type: 'date',
          value: ticketData.startTime,
        },
        {
          trait_type: 'Price',
          value: ticketData.price,
        },
        {
          trait_type: 'Token ID',
          value: ticketData.tokenId,
        },
      ],
    };

    try {
      const result = await this.uploadMetadata(
        metadata,
        `ticket-${ticketData.tokenId}-metadata.json`
      );
      return result;
    } catch (error) {
      logger.error('Error generating ticket metadata:', error);
      throw error;
    }
  }

  /**
   * Unpin file from IPFS
   */
  async unpinFile(ipfsHash) {
    try {
      await this.pinata.unpin(ipfsHash);
      logger.info(`Unpinned from IPFS: ${ipfsHash}`);
      return true;
    } catch (error) {
      logger.error('Error unpinning from IPFS:', error);
      throw error;
    }
  }

  /**
   * Get pinned files
   */
  async getPinnedFiles(filters = {}) {
    try {
      const result = await this.pinata.pinList(filters);
      return result.rows;
    } catch (error) {
      logger.error('Error getting pinned files:', error);
      throw error;
    }
  }
}

const ipfsService = new IPFSService();

module.exports = ipfsService;
