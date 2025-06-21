const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { // The recipient user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Path: ./users/user.model.js from src/
    required: true,
    index: true
  },
  type: { // Category of the notification
    type: String,
    enum: [
        'streak_reminder', 'streak_achieved',
        'xp_milestone', 'level_up',
        'badge_earned',
        'challenge_invite_received', 'challenge_accepted', 'challenge_rejected', 'challenge_completed', 'challenge_failed',
        'new_follower',
        'mentor_reply',
        'doubt_answered_by_ai', 'doubt_answered_by_mentor',
        'subscription_update',
        'new_material_available',
        'system_announcement',
        'other'
    ],
    required: true,
  },
  title: { // A short title for the notification
    type: String,
    required: [true, "Notification title is required."],
    trim: true
  },
  message: { // The main content of the notification
    type: String,
    required: [true, "Notification message is required."],
    trim: true,
    maxlength: [500, "Notification message is too long."]
  },
  link: { // Optional URL to navigate to when notification is clicked
    type: String, // e.g., /challenges/invite/:inviteId, /profile/:username, /doubts/:doubtId
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: { // Timestamp when the notification was marked as read
    type: Date
  },
  // createdAt will be added by timestamps:true
  // icon: String, // Optional icon associated with the notification type
  metadata: { // Any additional data related to the notification
    type: mongoose.Schema.Types.Mixed
    // e.g., { badgeId: '...', challengeId: '...', fromUserId: '...' }
  }
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 }); // For fetching user's unread/recent notifications

module.exports = mongoose.model('Notification', notificationSchema);
