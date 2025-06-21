const mongoose = require('mongoose');

const userChallengeProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Will be src/users/user.model.js
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge', // Will be src/challenges/challenge.model.js
    required: true
  },
  progress: { // Stores current progress against challenge.criteria
    // Example for criteria { type: 'completeMockTests', count: 2 } -> progress: { completeMockTests: 1 }
    // Example for criteria { type: 'earnXP', amount: 100 } -> progress: { currentXP: 50 }
    type: Object,
    default: {}
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  startedAt: { // When the user started this specific challenge
    type: Date,
    default: Date.now
  },
  completedAt: { // When the user completed this specific challenge
    type: Date
  },
  lastUpdatedAt: { // When progress was last updated
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); // Adds createdAt and updatedAt, though lastUpdatedAt is more specific for progress

userChallengeProgressSchema.index({ user: 1, challenge: 1 }, { unique: true });
userChallengeProgressSchema.index({ user: 1, isCompleted: 1 });

// Update lastUpdatedAt before saving
userChallengeProgressSchema.pre('save', function(next) {
  if (this.isModified('progress') || this.isModified('isCompleted')) {
    this.lastUpdatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('UserChallengeProgress', userChallengeProgressSchema);
