const mongoose = require('mongoose');

const checkInLogSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    index: true,
  },
  eventId: {
    type: Number,
    required: true,
    ref: 'Event',
    index: true,
  },
  ticketHolder: {
    type: String,
    required: true,
    lowercase: true,
    ref: 'User',
  },
  checkedInBy: {
    type: String,
    required: true,
    lowercase: true,
    ref: 'User',
  },
  checkInTime: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
  },
  deviceInfo: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
checkInLogSchema.index({ eventId: 1, checkInTime: -1 });
checkInLogSchema.index({ ticketHolder: 1 });

// Methods
checkInLogSchema.methods.toJSON = function() {
  const log = this.toObject();
  delete log.__v;
  return log;
};

const CheckInLog = mongoose.model('CheckInLog', checkInLogSchema);

module.exports = CheckInLog;
