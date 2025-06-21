const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { // Was 'title' in XPBadge, 'name' in Badge. Standardizing to 'name'.
    type: String,
    required: [true, 'Badge name is required.'],
    trim: true,
    unique: true // Assuming badge names should be unique
  },
  description: { // From XPBadge, made optional
    type: String,
    trim: true,
  },
  icon: { // Present in both
    type: String, // Path to icon or class name
    required: [true, 'Badge icon is required.']
  },
  xpThreshold: { // Was 'xpThreshold' in XPBadge, 'xpRequired' in Badge. Standardizing to 'xpThreshold'.
    type: Number,
    required: function() { return this.type === 'xp_threshold'; }, // Required only if type is 'xp_threshold'
    min: [0, 'XP threshold cannot be negative.']
  },
  type: { // To distinguish different kinds of badges
    type: String,
    enum: ['xp_threshold', 'milestone', 'streak_achievement', 'manual_award', 'other'],
    default: 'xp_threshold',
    required: true
  },
  // Specific criteria for other types of badges can be added here or in metadata
  criteria: { // For non-XP threshold badges, e.g., { completedChallenge: 'challenge_slug' }
    type: mongoose.Schema.Types.Mixed
  },
  isPublic: { // Whether the badge is visible to users before earning
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

badgeSchema.index({ name: 1 });
badgeSchema.index({ type: 1, xpThreshold: 1 });

module.exports = mongoose.model('Badge', badgeSchema);
