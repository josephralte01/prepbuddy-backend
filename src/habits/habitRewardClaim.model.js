const mongoose = require("mongoose");

const habitRewardClaimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Will be src/users/user.model.js
    required: true
  },
  habit: { // Optional: if the reward is for a specific predefined habit's streak
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit' // Will be src/habits/habit.model.js
  },
  type: { // Type of achievement that led to the reward
    type: String,
    enum: ["streak_milestone", "habit_completion_milestone", "perfect_week", "other"], // e.g., 3-day streak, 10th completion
    required: true
  },
  value: { // Value related to the type, e.g., streak length (3), completion count (10)
    type: String, // More flexible, could be "7-day" or "10-completions"
    required: true
  },
  reward: { // Details of the reward claimed
    xpGranted: { type: Number, default: 0 },
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }, // src/xp/badge.model.js
    // other items, virtual currency etc.
  },
  claimedAt: {
    type: Date,
    default: Date.now
  }
});

// Unique index to prevent claiming the same milestone reward multiple times
// User can only claim a "7-day streak" reward for a specific habit (or globally) once.
habitRewardClaimSchema.index({ user: 1, type: 1, value: 1, habit: 1 }, { unique: true });

module.exports = mongoose.model("HabitRewardClaim", habitRewardClaimSchema);
