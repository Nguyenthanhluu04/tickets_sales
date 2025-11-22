const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  from: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  to: {
    type: String,
    lowercase: true,
  },
  eventId: {
    type: Number,
    ref: 'Event',
  },
  ticketTypeId: {
    type: Number,
  },
  tokenId: {
    type: String,
  },
  amount: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  type: {
    type: String,
    enum: ['purchase', 'transfer', 'checkin', 'event_creation', 'ticket_type_creation'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  blockNumber: {
    type: Number,
  },
  gasUsed: {
    type: String,
  },
  gasPrice: {
    type: String,
  },
  error: {
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
transactionSchema.index({ from: 1, type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ eventId: 1 });

// Methods
transactionSchema.methods.toJSON = function() {
  const transaction = this.toObject();
  delete transaction.__v;
  return transaction;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
