const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['xp_reminder', 'streak_reminder', 'challenge_invite'], required: true },
  message: String,
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
