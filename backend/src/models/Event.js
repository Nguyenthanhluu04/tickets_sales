const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    trim: true,
  },
  venue: {
    type: String,
    trim: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  bannerImage: {
    type: String,
  },
  bannerImageIPFS: {
    type: String,
  },
  organizer: {
    type: String,
    ref: 'User',
    required: true,
    lowercase: true,
  },
  category: {
    type: String,
    enum: ['music', 'concert', 'sports', 'conference', 'theater', 'festival', 'workshop', 'other'],
    default: 'other',
  },
  totalTicketsSold: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: String,
    default: '0',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  transactionHash: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
eventSchema.index({ organizer: 1 });
eventSchema.index({ startTime: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ isFeatured: 1 });

// Virtual for ticket types
eventSchema.virtual('ticketTypes', {
  ref: 'TicketType',
  localField: 'eventId',
  foreignField: 'eventId',
});

// Methods
eventSchema.methods.toJSON = function() {
  const event = this.toObject({ virtuals: true });
  delete event.__v;
  return event;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
