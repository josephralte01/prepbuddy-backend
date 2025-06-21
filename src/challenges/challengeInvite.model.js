const mongoose = require('mongoose');

const challengeInviteSchema = new mongoose.Schema({
  type: { // Type of challenge this invite pertains to, if applicable (e.g., a pre-defined challenge or ad-hoc)
    type: String,
    enum: ['1v1_xp_race', 'group_goal', 'custom'], // Example types
    default: 'custom'
  },
  challengeDefinition: { // Could link to a pre-defined Challenge or store ad-hoc details
    challengeId: { // Link to a Challenge in the Challenge collection
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    },
    title: String, // For custom challenges not in Challenge collection
    description: String, // For custom challenges
    goal: { type: mongoose.Schema.Types.Mixed } // e.g. { type: 'xp', amount: 100 } or { type: 'tasks', count: 5 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Will be src/users/user.model.js
    required: true
  },
  // Participants array stores users invited and their status
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Will be src/users/user.model.js
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'failed'],
      default: 'pending'
    },
    progress: { type: mongoose.Schema.Types.Mixed }, // e.g., { xpEarned: 50 }
    joinedAt: Date,
    completedAt: Date // If this participant completed their part
  }],
  // Target specific users for invite, or can be open if type allows
  invitedUsers: [{ // Explicitly invited users if not all in participants list start as pending
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    min: 2 // For 1v1 or group challenges
  },
  status: { // Overall status of the invite/challenge spawned from it
    type: String,
    enum: ['pending_responses', 'active', 'completed', 'cancelled', 'expired'],
    default: 'pending_responses'
  },
  // goalXP: { type: Number, default: 100 }, // Moved to challengeDefinition.goal
  // startedAt: Date, // Moved to actual challenge instance if created
  // completedAt: Date, // Moved to actual challenge instance if created
  expiresAt: { // When the invite itself expires if not accepted
    type: Date
  },
  // isActive: { type: Boolean, default: true }, // Replaced by more specific 'status'
}, { timestamps: true }); // Adds createdAt and updatedAt

challengeInviteSchema.index({ createdBy: 1, status: 1 });
challengeInviteSchema.index({ "participants.user": 1, status: 1 });


module.exports = mongoose.model('ChallengeInvite', challengeInviteSchema);
