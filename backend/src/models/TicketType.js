const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
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
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: String,
    required: true,
  },
  maxSupply: {
    type: Number,
    required: true,
  },
  currentSupply: {
    type: Number,
    default: 0,
  },
  startSaleTime: {
    type: Date,
    required: true,
  },
  endSaleTime: {
    type: Date,
    required: true,
  },
  benefits: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  transactionHash: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
ticketTypeSchema.index({ eventId: 1, isActive: 1 });

// Virtual for remaining tickets
ticketTypeSchema.virtual('remainingSupply').get(function() {
  return this.maxSupply - this.currentSupply;
});

// Methods
ticketTypeSchema.methods.toJSON = function() {
  const ticketType = this.toObject({ virtuals: true });
  delete ticketType.__v;
  return ticketType;
};

const TicketType = mongoose.model('TicketType', ticketTypeSchema);

module.exports = TicketType;
