/**
 * Test IPFS Upload Functionality
 * Run: node scripts/test-ipfs-upload.js
 */

require('dotenv').config();
const ipfsConfig = require('../src/config/ipfs');
const ipfsService = require('../src/services/ipfsService');
const { logger } = require('../src/utils/logger');

async function testIPFSUpload() {
  try {
    logger.info('=== Testing IPFS Upload ===');

    // Initialize IPFS
    logger.info('Step 1: Initializing IPFS/Pinata...');
    await ipfsConfig.initialize();
    await ipfsService.initialize();

    // Test upload from URL (use a sample image)
    const testImageUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
    const fileName = 'test-event-banner.jpg';

    logger.info('Step 2: Uploading image from URL...');
    logger.info(`URL: ${testImageUrl}`);
    logger.info(`Filename: ${fileName}`);

    const result = await ipfsService.uploadImageFromURL(testImageUrl, fileName);

    logger.info('=== Upload Successful! ===');
    logger.info(`IPFS Hash: ${result.ipfsHash}`);
    logger.info(`IPFS URL: ${result.url}`);
    logger.info(`Gateway URL: https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`);

    logger.info('\n✅ Test completed successfully!');
    logger.info(`You can view the image at: ${result.url}`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Test failed:', error);
    logger.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    process.exit(1);
  }
}

testIPFSUpload();
