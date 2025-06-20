// === models/Habit.js ===
const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  criteria: {
    type: Object,
    required: true,
  },
  xpReward: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
