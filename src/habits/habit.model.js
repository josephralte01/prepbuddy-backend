const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Habit title is required."],
    trim: true,
    unique: true // Assuming habit titles are unique
  },
  description: {
    type: String,
    trim: true
  },
  frequency: { // How often the habit should be done
    type: String,
    enum: ['daily', 'weekly', 'specific_days'], // 'specific_days' could use an array for days e.g., [0, 2, 4] for Sun, Tue, Thu
    default: 'daily',
    required: true
  },
  specificDays: { // For 'specific_days' frequency, array of day numbers (0=Sun, 1=Mon, ...)
    type: [Number],
    validate: {
        validator: function(v) {
            return this.frequency !== 'specific_days' || (Array.isArray(v) && v.length > 0 && v.every(d => d >= 0 && d <= 6));
        },
        message: 'Specific days must be provided as an array of numbers (0-6) if frequency is specific_days.'
    }
  },
  criteria: { // What constitutes completing the habit
    // Examples:
    // { type: 'complete_task', taskSlug: 'read_one_chapter' }
    // { type: 'log_activity', activityName: 'meditation', durationMinutes: 10 }
    // { type: 'reach_xp_in_category', amount: 50, category: 'problem_solving' }
    type: Object,
    required: [true, "Habit completion criteria are required."]
  },
  xpReward: { // XP awarded upon successful completion of one instance
    type: Number,
    default: 10,
    min: 0
  },
  streakThresholdForBonus: { // e.g., after a 7-day streak, bonus XP or badge
      type: Number,
      min: 1
  },
  bonusReward: { // What is given after reaching streakThresholdForBonus
      xp: { type: Number, default: 0 },
      badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' } // src/xp/badge.model.js
  },
  category: { // For grouping habits, e.g., 'study', 'wellness', 'productivity'
    type: String,
    trim: true
  },
  isActive: { // Whether this habit template is active and can be picked by users
    type: Boolean,
    default: true
  }
}, { timestamps: true });

habitSchema.index({ title: 1 });
habitSchema.index({ isActive: 1, frequency: 1 });

module.exports = mongoose.model('Habit', habitSchema);
