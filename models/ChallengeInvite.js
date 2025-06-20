// === models/ChallengeInvite.js ===
const mongoose = require('mongoose');

const challengeInviteSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['1v1', 'group'],
    default: '1v1'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    joinedAt: Date
  }],
  goalXP: {
    type: Number,
    default: 100
  },
  startedAt: Date,
  completedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
}, { timestamps: true });

module.exports = mongoose.model('ChallengeInvite', challengeInviteSchema);
