const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { apiResponse, verifySignature, generateNonce } = require('../utils/helpers');
const { logger } = require('../utils/logger');

/**
 * @desc Login with wallet signature
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json(
        apiResponse(false, 'Wallet address and signature required')
      );
    }

    const address = walletAddress.toLowerCase();

    // Get or create user
    let user = await User.findOne({ walletAddress: address });
    if (!user) {
      user = await User.create({
        walletAddress: address,
        nonce: generateNonce(),
      });
    }

    // Verify signature
    const message = `Sign this message to authenticate: ${user.nonce}`;
    const isValid = verifySignature(message, signature, address);

    if (!isValid) {
      return res.status(401).json(
        apiResponse(false, 'Invalid signature')
      );
    }

    // Update nonce
    user.nonce = generateNonce();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    logger.info(`User logged in: ${address}`);

    res.json(apiResponse(true, 'Login successful', {
      token,
      user: user.toJSON(),
    }));
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get nonce for wallet
 * @route GET /api/auth/nonce/:walletAddress
 */
exports.getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const address = walletAddress.toLowerCase();

    let user = await User.findOne({ walletAddress: address });
    
    if (!user) {
      user = await User.create({
        walletAddress: address,
        nonce: generateNonce(),
      });
    }

    res.json(apiResponse(true, 'Nonce retrieved', {
      nonce: user.nonce,
      message: `Sign this message to authenticate: ${user.nonce}`,
    }));
  } catch (error) {
    logger.error('Get nonce error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};

/**
 * @desc Get current user
 * @route GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json(apiResponse(false, 'User not found'));
    }

    res.json(apiResponse(true, 'User retrieved', user.toJSON()));
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json(apiResponse(false, 'Server error', null, error.message));
  }
};
