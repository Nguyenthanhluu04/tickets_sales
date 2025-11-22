const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  async initialize() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      logger.warn('Email service not configured');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await this.transporter.verify();
      logger.info('✅ Email service initialized');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Send ticket purchase confirmation email
   */
  async sendTicketPurchaseEmail(to, ticketData) {
    if (!this.transporter) return;

    try {
      const mailOptions = {
        from: `"NFT Ticketing" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `Ticket Confirmation - ${ticketData.eventName}`,
        html: this.ticketPurchaseTemplate(ticketData),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Ticket purchase email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending ticket purchase email:', error);
    }
  }

  /**
   * Send event creation confirmation
   */
  async sendEventCreatedEmail(to, eventData) {
    if (!this.transporter) return;

    try {
      const mailOptions = {
        from: `"NFT Ticketing" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `Event Created - ${eventData.name}`,
        html: this.eventCreatedTemplate(eventData),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Event creation email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending event created email:', error);
    }
  }

  /**
   * Send check-in notification
   */
  async sendCheckInEmail(to, ticketData) {
    if (!this.transporter) return;

    try {
      const mailOptions = {
        from: `"NFT Ticketing" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `Check-in Successful - ${ticketData.eventName}`,
        html: this.checkInTemplate(ticketData),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Check-in email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending check-in email:', error);
    }
  }

  // Email Templates
  ticketPurchaseTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .ticket-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Ticket Purchase Successful!</h1>
          </div>
          <div class="content">
            <p>Congratulations! Your ticket has been successfully purchased.</p>
            
            <div class="ticket-info">
              <h2>${data.eventName}</h2>
              <p><strong>Ticket Type:</strong> ${data.ticketTypeName}</p>
              <p><strong>Event Date:</strong> ${new Date(data.startTime).toLocaleString()}</p>
              <p><strong>Location:</strong> ${data.location || 'TBA'}</p>
              <p><strong>Token ID:</strong> ${data.tokenId}</p>
              <p><strong>Transaction:</strong> ${data.transactionHash}</p>
            </div>

            <p>Your ticket is stored as an NFT in your wallet. You can view it in the "My Tickets" section.</p>
            <p>Please present the QR code on your ticket at the event entrance.</p>
          </div>
          <div class="footer">
            <p>Thank you for using NFT Ticketing Platform!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  eventCreatedTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Event Created Successfully!</h1>
          </div>
          <div class="content">
            <h2>${data.name}</h2>
            <p>Your event has been created on the blockchain!</p>
            <p><strong>Event ID:</strong> ${data.eventId}</p>
            <p><strong>Start Time:</strong> ${new Date(data.startTime).toLocaleString()}</p>
            <p>Next step: Create ticket types for your event.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  checkInTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Check-in Successful!</h1>
          </div>
          <div class="content">
            <p>You have successfully checked in to:</p>
            <h2>${data.eventName}</h2>
            <p><strong>Check-in Time:</strong> ${new Date().toLocaleString()}</p>
            <p>Enjoy the event!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

const emailService = new EmailService();

module.exports = emailService;
