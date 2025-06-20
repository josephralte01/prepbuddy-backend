// === models/UserHabitProgress.js ===
const mongoose = require('mongoose');

const userHabitProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  lastCompleted: Date,
  streak: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

userHabitProgressSchema.index({ user: 1, habit: 1 }, { unique: true });

module.exports = mongoose.model('UserHabitProgress', userHabitProgressSchema);
