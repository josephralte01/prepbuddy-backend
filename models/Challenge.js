const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'milestone'], required: true },
  description: String,
  xpReward: { type: Number, default: 50 },
  criteria: { type: Object, required: true }, // e.g., { completeMockTests: 2 }
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', challengeSchema);
v