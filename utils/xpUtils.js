// 📁 backend/utils/xpUtils.js
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const XPBadge = require('../models/XPBadge');
const logXP = require('./xpLogger');

module.exports.updateXPAndStreak = async (userId, xpToAdd, type, metadata = {}) => {
  const user = await User.findById(userId);
  if (!user) return;

  const previousXP = user.xp;
  user.xp += xpToAdd;

  // Streak logic
  const now = new Date();
  const lastActive = new Date(user.lastActiveDate);
  const diff = (now - lastActive) / (1000 * 60 * 60 * 24);
  if (diff >= 1 && diff < 2) user.streak += 1;
  else if (diff >= 2) user.streak = 1;
  user.lastActiveDate = now;

  await user.save();

  // Log XP
  await logXP(userId, xpToAdd, type, metadata);

  // Badge check
  const unlockedBadges = await XPBadge.find({ xp: { $gt: previousXP, $lte: user.xp } });
  for (const badge of unlockedBadges) {
    await logXP(userId, 0, 'badge', { badge: badge.name });
  }
};
