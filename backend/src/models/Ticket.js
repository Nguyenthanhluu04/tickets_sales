const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  eventId: {
    type: Number,
    required: true,
    ref: 'Event',
    index: true,
  },
  ticketTypeId: {
    type: Number,
    required: true,
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    ref: 'User',
    index: true,
  },
  ticketTypeName: {
    type: String,
  },
  price: {
    type: String,
    required: true,
  },
  metadataURI: {
    type: String,
  },
  metadataIPFS: {
    type: String,
  },
  qrCode: {
    type: String,
  },
  transactionHash: {
    type: String,
    required: true,
    index: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  checkedInAt: {
    type: Date,
  },
  checkedInBy: {
    type: String,
    lowercase: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
ticketSchema.index({ owner: 1, eventId: 1 });
ticketSchema.index({ isUsed: 1 });
ticketSchema.index({ purchasedAt: -1 });

// Methods
ticketSchema.methods.toJSON = function() {
  const ticket = this.toObject();
  delete ticket.__v;
  return ticket;
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
