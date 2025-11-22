const QRCode = require('qrcode');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

class QRCodeService {
  /**
   * Generate QR code for ticket
   */
  async generateTicketQR(ticketData) {
    try {
      // Create verification payload
      const payload = {
        tokenId: ticketData.tokenId,
        eventId: ticketData.eventId,
        owner: ticketData.owner,
        timestamp: Date.now(),
      };

      // Create signature
      const signature = this.createSignature(payload);
      
      // Combine payload and signature
      const qrData = JSON.stringify({
        ...payload,
        signature,
      });

      // Generate QR code as base64 data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      logger.info(`QR code generated for token ${ticketData.tokenId}`);

      return {
        qrCode: qrCodeDataURL,
        payload,
      };
    } catch (error) {
      logger.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Verify QR code data
   */
  verifyQRData(qrData) {
    try {
      const data = JSON.parse(qrData);
      const { signature, ...payload } = data;

      // Verify signature
      const expectedSignature = this.createSignature(payload);
      
      if (signature !== expectedSignature) {
        return { valid: false, reason: 'Invalid signature' };
      }

      // Check timestamp (valid for 5 minutes)
      const now = Date.now();
      const qrTimestamp = payload.timestamp;
      const fiveMinutes = 5 * 60 * 1000;

      if (now - qrTimestamp > fiveMinutes) {
        return { valid: false, reason: 'QR code expired' };
      }

      return { valid: true, payload };
    } catch (error) {
      logger.error('Error verifying QR data:', error);
      return { valid: false, reason: 'Invalid QR code format' };
    }
  }

  /**
   * Create signature for payload
   */
  createSignature(payload) {
    const secret = process.env.JWT_SECRET;
    const dataString = JSON.stringify(payload);
    
    return crypto
      .createHmac('sha256', secret)
      .update(dataString)
      .digest('hex');
  }

  /**
   * Generate event QR code
   */
  async generateEventQR(eventData) {
    try {
      const qrData = JSON.stringify({
        type: 'event',
        eventId: eventData.eventId,
        name: eventData.name,
        url: `${process.env.FRONTEND_URL}/events/${eventData.eventId}`,
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        width: 400,
      });

      return qrCodeDataURL;
    } catch (error) {
      logger.error('Error generating event QR code:', error);
      throw error;
    }
  }
}

const qrCodeService = new QRCodeService();

module.exports = qrCodeService;
