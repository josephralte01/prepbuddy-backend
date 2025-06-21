const Badge = require('./badge.model.js'); // Assuming Badge model is in src/xp/
const User = require('../users/user.model.js'); // Future path

/**
 * Checks for and awards habit-related streak badges.
 * This function would typically be called after a habit is completed or a streak is updated.
 * @param {string} userId - The ID of the user.
 * @param {object} habitProgressMap - A map or object representing user's habit progress and streaks.
 *                                   Example: { habitId1: { streak: 10 }, habitId2: { streak: 5 } }
 */
async function checkAndAwardHabitStreakBadges(userId, habitProgressMap = {}) {
  if (!userId) return;

  const user = await User.findById(userId).select('badges');
  if (!user) return;

  const awardedNewBadges = [];
  const streaks = Object.values(habitProgressMap).map(p => p.streak || 0);

  // Define criteria for streak badges directly or fetch from Badge model
  const streakBadgeCriteria = [
    { name: '7-Day Habit Streak', requiredStreak: 7, type: 'streak_achievement' }, // Example name, align with Badge model
    { name: '30-Day Habit Beast', requiredStreak: 30, type: 'streak_achievement' }, // Example name
    // Add more specific streak badges here
  ];

  for (const criteria of streakBadgeCriteria) {
    if (streaks.some(s => s >= criteria.requiredStreak)) {
      const badgeToAward = await Badge.findOne({ name: criteria.name, type: criteria.type });
      if (badgeToAward && !user.badges.some(b => b.equals(badgeToAward._id))) {
        user.badges.push(badgeToAward._id);
        awardedNewBadges.push(badgeToAward);
        // Consider logging this event (e.g., XPLog or Notification)
      }
    }
  }

  if (awardedNewBadges.length > 0) {
    await user.save();
    // console.log(`User ${userId} awarded new habit streak badges:`, awardedNewBadges.map(b => b.name));
  }
  return awardedNewBadges;
}


/**
 * Calculates current streak based on last active date.
 * @param {Date} lastActiveDate - The user's last active date.
 * @param {number} currentStreak - The user's current streak.
 * @returns {{ streak: number, needsUpdate: boolean, newLastActiveDate: Date }}
 */
function calculateUserStreak(lastActiveDate, currentStreak = 0) {
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const lastActiveNormalized = lastActiveDate
    ? new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate())
    : null;

  let updatedStreak = currentStreak;
  let needsSave = false;
  let newActiveDate = lastActiveDate || today;


  if (!lastActiveNormalized || lastActiveNormalized.getTime() < todayNormalized.getTime()) {
    // Activity on a new day
    newActiveDate = today; // Update last active date to current moment
    needsSave = true;

    if (lastActiveNormalized && (todayNormalized.getTime() - lastActiveNormalized.getTime()) === (24 * 60 * 60 * 1000)) {
      updatedStreak = (currentStreak || 0) + 1; // Increment streak
    } else if (lastActiveNormalized && (todayNormalized.getTime() - lastActiveNormalized.getTime()) > (24 * 60 * 60 * 1000)) {
      updatedStreak = 1; // Reset streak if more than 1 day passed
    } else if (!lastActiveNormalized) { // First activity or streak was 0
      updatedStreak = 1;
    }
  }
  // If lastActiveNormalized is today, streak doesn't change from this specific interaction,
  // unless it was the first interaction of the day that established the streak.
  // The needsSave flag indicates if lastActiveDate or streak potentially changed.

  return { streak: updatedStreak, needsUpdate: needsSave, newLastActiveDate: newActiveDate };
}


const Badge = require('./badge.model.js'); // Assuming Badge model is in src/xp/
const User = require('../users/user.model.js'); // Future path

/**
 * Checks for and awards habit-related streak badges.
 * This function would typically be called after a habit is completed or a streak is updated.
 * @param {string} userId - The ID of the user.
 * @param {object} habitProgressMap - A map or object representing user's habit progress and streaks.
 *                                   Example: { habitId1: { streak: 10 }, habitId2: { streak: 5 } }
 */
async function checkAndAwardHabitStreakBadges(userId, habitProgressMap = {}) {
  if (!userId) return;

  const user = await User.findById(userId).select('badges');
  if (!user) return;

  const awardedNewBadges = [];
  const streaks = Object.values(habitProgressMap).map(p => p.streak || 0);

  // Define criteria for streak badges directly or fetch from Badge model
  const streakBadgeCriteria = [
    { name: '7-Day Habit Streak', requiredStreak: 7, type: 'streak_achievement' }, // Example name, align with Badge model
    { name: '30-Day Habit Beast', requiredStreak: 30, type: 'streak_achievement' }, // Example name
    // Add more specific streak badges here
  ];

  for (const criteria of streakBadgeCriteria) {
    if (streaks.some(s => s >= criteria.requiredStreak)) {
      const badgeToAward = await Badge.findOne({ name: criteria.name, type: criteria.type });
      if (badgeToAward && !user.badges.some(b => b.equals(badgeToAward._id))) {
        user.badges.push(badgeToAward._id);
        awardedNewBadges.push(badgeToAward);
        // Consider logging this event (e.g., XPLog or Notification)
      }
    }
  }

  if (awardedNewBadges.length > 0) {
    await user.save();
    // console.log(`User ${userId} awarded new habit streak badges:`, awardedNewBadges.map(b => b.name));
  }
  return awardedNewBadges;
}


/**
 * Calculates current streak based on last active date.
 * @param {Date} lastActiveDate - The user's last active date.
 * @param {number} currentStreak - The user's current streak.
 * @returns {{ streak: number, needsUpdate: boolean, newLastActiveDate: Date }}
 */
function calculateUserStreak(lastActiveDate, currentStreak = 0) {
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const lastActiveNormalized = lastActiveDate
    ? new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate())
    : null;

  let updatedStreak = currentStreak;
  let needsSave = false;
  let newActiveDate = lastActiveDate || today;


  if (!lastActiveNormalized || lastActiveNormalized.getTime() < todayNormalized.getTime()) {
    // Activity on a new day
    newActiveDate = today; // Update last active date to current moment
    needsSave = true;

    if (lastActiveNormalized && (todayNormalized.getTime() - lastActiveNormalized.getTime()) === (24 * 60 * 60 * 1000)) {
      updatedStreak = (currentStreak || 0) + 1; // Increment streak
    } else if (lastActiveNormalized && (todayNormalized.getTime() - lastActiveNormalized.getTime()) > (24 * 60 * 60 * 1000)) {
      updatedStreak = 1; // Reset streak if more than 1 day passed
    } else if (!lastActiveNormalized) { // First activity or streak was 0
      updatedStreak = 1;
    }
  }
  // If lastActiveNormalized is today, streak doesn't change from this specific interaction,
  // unless it was the first interaction of the day that established the streak.
  // The needsSave flag indicates if lastActiveDate or streak potentially changed.

  return { streak: updatedStreak, needsUpdate: needsSave, newLastActiveDate: newActiveDate };
}

/**
 * Finds users who were active the day before yesterday (or earlier) but not yesterday or today,
 * meaning their streak is at risk if they don't act today.
 * @returns {Promise<Array<User>>} A promise that resolves to an array of users needing reminders.
 */
async function getUsersNeedingStreakReminder() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1); // Start of yesterday

  // Users whose last activity was before the start of yesterday.
  const users = await User.find({
    lastActiveDate: { $lt: yesterday },
  }).select('_id name email streak lastActiveDate');

  return users;
}

module.exports = {
  checkAndAwardHabitStreakBadges,
  calculateUserStreak,
  getUsersNeedingStreakReminder,
};
