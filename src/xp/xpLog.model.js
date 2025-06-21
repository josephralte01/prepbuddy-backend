const mongoose = require('mongoose');

const XPLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Will be src/users/user.model.js
    required: true,
  },
  action: { // Renaming 'type' to 'action' for clarity from original controller
    type: String,
    // enum: ['material_complete', 'mock_test_submit'], // This enum was too restrictive based on controller usage
    required: true,
  },
  xpEarned: { // Renaming 'xpGained' to 'xpEarned' for consistency with controller
    type: Number,
    required: true,
  },
  referenceId: { // Optional: e.g. chapterId or mockTestSessionId
    type: mongoose.Schema.Types.ObjectId,
    // required: true, // Making it optional as not all XP actions might have a direct reference
  },
  metadata: { // For additional context
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: { // Renaming 'timestamp' to 'createdAt' for consistency
    type: Date,
    default: Date.now,
  }
});

XPLogSchema.index({ user: 1, createdAt: -1 });
XPLogSchema.index({ user: 1, action: 1, createdAt: -1 });


module.exports = mongoose.model('XPLog', XPLogSchema);
