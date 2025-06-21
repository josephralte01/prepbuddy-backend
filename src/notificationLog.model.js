const mongoose = require('mongoose');

// This model logs system-initiated notifications, especially those sent via external channels like email.
// User-facing in-app notifications are typically handled by the 'Notification' model.
const notificationLogSchema = new mongoose.Schema({
  user: { // The user to whom the notification was sent (optional if it's a general broadcast)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Path: ./users/user.model.js from src/
  },
  channel: { // e.g., 'email', 'sms', 'push_notification'
    type: String,
    enum: ['email', 'sms', 'push_notification', 'in_app_system'],
    required: true,
    default: 'email'
  },
  type: { // Type of notification sent, can align with Notification model types or be specific to logged events
    type: String,
    enum: ['xp_reminder', 'streak_reminder', 'challenge_invite_alert', 'password_reset', 'email_verification', 'system_broadcast'],
    required: true
  },
  subject: { // e.g., Email subject
    type: String
  },
  messagePreview: { // Short preview of the message sent
    type: String,
    maxlength: [200, "Message preview too long."]
  },
  status: { // Status of the sending attempt
    type: String,
    enum: ['sent', 'failed', 'pending', 'delivered', 'opened', 'clicked'], // More detailed status for external channels
    default: 'sent'
  },
  failureReason: {
    type: String
  },
  // sentAt is essentially createdAt from timestamps
  // metadata: { type: mongoose.Schema.Types.Mixed } // Any additional context
}, { timestamps: true }); // Adds createdAt (effectively sentAt) and updatedAt

notificationLogSchema.index({ type: 1, status: 1, createdAt: -1 });
notificationLogSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
