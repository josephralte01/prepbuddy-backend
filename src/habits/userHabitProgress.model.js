const mongoose = require('mongoose');

const userHabitProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Will be src/users/user.model.js
    required: true,
  },
  habit: { // The predefined habit template
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit', // Will be src/habits/habit.model.js
    required: true,
  },
  lastCompletedAt: { // Timestamp of the last time this specific habit instance was marked complete
    type: Date,
  },
  currentStreak: { // Current number of consecutive completions as per habit's frequency
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  // For habits with quantifiable progress towards one completion, e.g. "read 50 pages"
  // For simple check-off habits, this might not be needed.
  completionProgress: { // e.g., { pagesRead: 20, targetPages: 50 }
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // History of completions for this habit by this user (optional, can grow large)
  // completionLog: [{
  //   completedAt: { type: Date, default: Date.now },
  //   notes: String
  // }],
  isActive: { // Is the user actively tracking/doing this habit?
      type: Boolean,
      default: true // User can pause a habit
  }
}, { timestamps: true }); // createdAt for when user started tracking, updatedAt for last progress update

userHabitProgressSchema.index({ user: 1, habit: 1 }, { unique: true });
userHabitProgressSchema.index({ user: 1, isActive: 1, currentStreak: -1 });

// Update longestStreak if currentStreak surpasses it
userHabitProgressSchema.pre('save', function(next) {
  if (this.isModified('currentStreak')) {
    if (this.currentStreak > (this.longestStreak || 0)) {
      this.longestStreak = this.currentStreak;
    }
  }
  next();
});


module.exports = mongoose.model('UserHabitProgress', userHabitProgressSchema);
