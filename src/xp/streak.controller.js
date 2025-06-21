const User = require('../../users/user.model.js'); // Future path
const { awardXP } = require('./xpUtils.js'); // Consolidated XP utility

/**
 * Allows a user to recover a lost streak, potentially at a cost.
 */
exports.recoverStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Determine if streak was lost "yesterday"
    // This logic needs to be robust. A simple date check might not be enough due to timezones or exact timing.
    // For this example, we'll assume a simplified check:
    // A streak is "lost" if lastActiveDate was two days ago relative to today (normalized).

    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (!lastActive) {
        return res.status(400).json({ message: 'No activity found to recover a streak from.' });
    }
    const lastActiveNormalized = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffInDays = (todayNormalized.getTime() - lastActiveNormalized.getTime()) / oneDayMs;

    // Condition for streak recovery:
    // 1. User currently has a streak of 0 (or it implies they lost it).
    // 2. Last activity was exactly "the day before yesterday" (diffInDays === 2), meaning they missed "yesterday".
    //    Or, if their current streak is 0 and last activity was "yesterday" (diffInDays === 1), they already broke it today by not acting.

    // A simpler rule: if streak is 0 and last active was yesterday, they can "revive" it for today.
    // Or if last active was day before yesterday, they can pay to bridge the gap.

    // Let's use the logic from original controller: missedYesterday implies last active was yesterday, and current streak is < 1 (broken)
    // The original logic: `now.getDate() - lastActive.getDate() === 1` is problematic across month/year boundaries.
    // A more robust check for "last active was yesterday":
    const yesterdayNormalized = new Date(todayNormalized.getTime() - oneDayMs);

    const canRecover = user.streak === 0 && lastActiveNormalized.getTime() === yesterdayNormalized.getTime();

    if (!canRecover) {
      return res.status(400).json({ message: 'Streak recovery is not applicable or available at this time.' });
    }

    const recoveryCost = 50; // Example cost
    if ((user.xp || 0) < recoveryCost) {
      return res.status(400).json({ message: `Not enough XP to recover streak. Cost: ${recoveryCost} XP.` });
    }

    // Deduct XP
    await awardXP(user._id, -recoveryCost, 'streak_recovery_cost', null, { previousStreak: user.streak });

    // Restore streak (e.g., set to 1, or to what it was before + 1 if more complex logic)
    // For simplicity, setting to 1 and updating last active date to today.
    user.streak = user.previousStreakForRecovery || 1; // A field to store pre-break streak might be needed for true "recovery"
                                      // Or, simply set to 1 to continue from "today".
                                      // The original code sets user.streak = 1 and user.lastActiveDate = now.
    user.streak = 1; // As per original logic after payment
    user.lastActiveDate = new Date(); // Mark as active today

    // Need to fetch the user again to get the updated XP after awardXP
    const updatedUser = await User.findById(req.user._id);
    updatedUser.streak = 1;
    updatedUser.lastActiveDate = new Date();
    await updatedUser.save();


    res.status(200).json({
        message: 'Streak recovered successfully!',
        xp: updatedUser.xp,
        streak: updatedUser.streak
    });

  } catch (err) {
    console.error('Error recovering streak:', err);
    res.status(500).json({ message: 'Error recovering streak.', error: err.message });
  }
};

// Placeholder for other potential streak-related controller functions
// e.g., getStreakStatus, getStreakHistory (if we log streak changes)
exports.getStreakStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('streak lastActiveDate');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({ streak: user.streak || 0, lastActiveDate: user.lastActiveDate });
    } catch (error) {
        console.error('Error fetching streak status:', error);
        res.status(500).json({ message: 'Error fetching streak status.' });
    }
};
