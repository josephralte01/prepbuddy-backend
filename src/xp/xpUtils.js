// 📁 backend/utils/xpUtils.js
const User = require('../users/user.model.js'); // Future path
const XPLog = require('./xpLog.model.js');     // Corrected path
const Badge = require('./badge.model.js');     // Corrected path to merged Badge model
// const { logXPActivity } = require('./xpLogger.util.js'); // Removed, functionality integrated

// This function will be the primary way to add XP and handle related logic like streaks and badges.
async function awardXP(userId, xpAmount, action, referenceId = null, metadata = {}) {
  if (!userId || typeof xpAmount !== 'number' || xpAmount === 0) { // Allow negative XP for adjustments if needed, or add check xpAmount > 0
    // console.error("awardXP: Invalid parameters", { userId, xpAmount, action });
    // return null; // Or throw error
  }

  const user = await User.findById(userId);
  if (!user) {
    // console.error("awardXP: User not found", { userId });
    // return null; // Or throw error
  }

  const oldXP = user.xp || 0;
  user.xp = oldXP + xpAmount;

  // Log this specific XP change
  const xpLogEntry = {
    user: userId,
    xpEarned: xpAmount,
    action: action,
    metadata: { ...metadata, previousXP: oldXP, newXP: user.xp }
  };
  if (referenceId) {
    xpLogEntry.referenceId = referenceId;
  }
  await XPLog.create(xpLogEntry);

  // Streak Logic - to be potentially moved to a streakUtils.js if more complex
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  let lastActiveDate = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if(lastActiveDate) lastActiveDate.setHours(0,0,0,0); // Normalize

  if (!lastActiveDate || lastActiveDate.getTime() < today.getTime()) { // Activity on a new day
    if (lastActiveDate && (today.getTime() - lastActiveDate.getTime()) === (24 * 60 * 60 * 1000)) {
      user.streak = (user.streak || 0) + 1; // Increment streak
    } else if (lastActiveDate && (today.getTime() - lastActiveDate.getTime()) > (24 * 60 * 60 * 1000)) {
      user.streak = 1; // Reset streak if more than 1 day passed
    } else if (!lastActiveDate) { // First activity
        user.streak = 1;
    }
    user.lastActiveDate = new Date(); // Update last active date to now (timestamp)
  }
  // If lastActiveDate is today, streak doesn't change for this XP event.

  await user.save(); // Save user changes (XP, streak, lastActiveDate)

  // Badge Awarding Logic - to be potentially moved to a badgeUtils.js or badgeService.js
  // This is a simplified version. More complex logic might involve checking various criteria.
  const newlyEarnedBadges = [];
  const allBadges = await Badge.find({ type: 'xp_threshold', xpThreshold: { $gt: oldXP, $lte: user.xp } });

  for (const badge of allBadges) {
    if (!user.badges.includes(badge._id)) {
      user.badges.push(badge._id);
      newlyEarnedBadges.push(badge);
      // Optionally, log badge earning as a special XPLog event or notification
      await XPLog.create({
          user: userId,
          xpEarned: 0, // Badges themselves might not give XP, or they could
          action: 'badge_earned',
          metadata: { badgeId: badge._id, badgeName: badge.name, awardedForXP: user.xp }
      });
    }
  }

  if (newlyEarnedBadges.length > 0) {
    await user.save(); // Save again if badges were added
  }

  return { user, xpLogEntry, newlyEarnedBadges };
}


// Original updateXPAndStreak - can be refactored to use awardXP or deprecated
// For now, I'll keep its structure but point to new dependencies.
// The logic in awardXP is more comprehensive.
module.exports.updateXPAndStreak = async (userId, xpToAdd, type, metadata = {}) => {
  const user = await User.findById(userId);
  if (!user) return;

  const previousXP = user.xp;
  user.xp += xpToAdd;

  // Streak logic
  const now = new Date();
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : new Date(0); // Handle undefined lastActiveDate

  const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActiveNormalized = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

  const diffInDays = (todayNormalized - lastActiveNormalized) / (1000 * 60 * 60 * 24);

  if (diffInDays === 1) { // Active on consecutive days
    user.streak = (user.streak || 0) + 1;
  } else if (diffInDays > 1) { // Missed a day or more
    user.streak = 1; // Reset streak
  } else if (diffInDays === 0 && user.streak === 0){ // First activity of the day for a new user or reset streak
      user.streak = 1;
  }
  // If diffInDays is 0 and streak > 0, means already active today, streak maintained.

  user.lastActiveDate = now; // Always update last active to current time

  await user.save();

  // Log XP
  await XPLog.create({
      user: userId,
      xpEarned: xpToAdd,
      action: type,
      referenceId: metadata.referenceId, // This might be undefined, which is fine for optional field
      metadata
  });

  // Badge check (using the merged Badge model)
  const unlockedBadges = await Badge.find({
      type: 'xp_threshold',
      xpThreshold: { $gt: previousXP, $lte: user.xp }
  });

  let newBadgesAwarded = false;
  for (const badge of unlockedBadges) {
    if (!user.badges.some(b => b.equals(badge._id))) {
        user.badges.push(badge._id);
        newBadgesAwarded = true;
        await XPLog.create({
            user: userId,
            xpEarned: 0,
            action: 'badge_earned',
            metadata: {badgeName: badge.name, badgeId: badge._id.toString()}
        });
    }
  }
  if(newBadgesAwarded) await user.save();

  return user; // Return updated user
};

// Exporting the new consolidated function as well
module.exports.awardXP = awardXP;
