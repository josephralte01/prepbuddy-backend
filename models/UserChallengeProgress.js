const mongoose = require('mongoose');

const userChallengeProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  progress: { type: Object, default: {} }, // e.g., { completeMockTests: 1 }
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
});

userChallengeProgressSchema.index({ user: 1, challenge: 1 }, { unique: true });

module.exports = mongoose.model('UserChallengeProgress', userChallengeProgressSchema);
v