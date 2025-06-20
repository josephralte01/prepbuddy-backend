const mongoose = require('mongoose');

const xpBadgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  xpThreshold: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  icon: {
    type: String, // Optional emoji or icon name
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('XPBadge', xpBadgeSchema);
