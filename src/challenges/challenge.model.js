const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Challenge title is required."],
    trim: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'milestone', 'event'], // Added 'event' type
    required: [true, "Challenge type is required."]
  },
  description: {
    type: String,
    trim: true
  },
  xpReward: {
    type: Number,
    default: 50,
    min: [0, "XP reward cannot be negative."]
  },
  badgeReward: { // Optional badge awarded on completion
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge' // Refers to src/xp/badge.model.js
  },
  criteria: { // Flexible criteria for completing the challenge
    type: Object,
    required: [true, "Challenge criteria are required."]
    // e.g., { type: 'completeMockTests', count: 2 }
    // or { type: 'earnXP', amount: 100, category: 'mock_test' }
    // or { type: 'achieveStreak', length: 3, habitType: 'study' }
  },
  durationDays: { // Optional duration for timed challenges (e.g., weekly)
    type: Number,
    min: [1, "Duration must be at least 1 day."]
  },
  startTime: { // Optional start time for scheduled challenges
    type: Date
  },
  endTime: { // Optional end time for scheduled challenges
    type: Date
  },
  isPublic: { // Whether this challenge is available to all users or targeted
    type: Boolean,
    default: true
  },
  maxParticipants: { // For challenges with limited slots
    type: Number,
    min: [1, "Max participants must be at least 1."]
  },
  isActive: { // Whether the challenge is currently active and can be joined/progressed
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

challengeSchema.index({ type: 1, isActive: 1 });
challengeSchema.index({ title: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
