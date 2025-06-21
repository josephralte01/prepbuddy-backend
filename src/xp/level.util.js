/**
 * Calculates the user's current level based on XP.
 * @param {number} xp - The user's total experience points.
 * @returns {number} The calculated level.
 */
function calculateLevel(xp) {
  // Example: Level up every 100 XP for first 10 levels, then 200 XP, etc.
  // This is a simple linear progression for demonstration.
  // Adjust this formula to fit the desired leveling curve.
  if (xp < 0) return 1; // XP should not be negative for level calculation

  let level = 1;
  let xpForNextLevel = 100;
  let accumulatedXPForLevel = 0;

  while (xp >= accumulatedXPForLevel + xpForNextLevel) {
    accumulatedXPForLevel += xpForNextLevel;
    level++;
    // Example: Increase XP needed for next level (can be more complex)
    xpForNextLevel += 50; // Each level requires 50 more XP than the last
  }
  return level;
}

/**
 * Gets the name or title for a given level.
 * @param {number} level - The user's current level.
 * @returns {string|null} The name of the level, or null.
 */
function getLevelName(level) {
  if (level >= 20) return 'Grandmaster';
  if (level >= 15) return 'Master';
  if (level >= 10) return 'Expert';
  if (level >= 5) return 'Adept';
  if (level >= 2) return 'Novice';
  if (level >= 1) return 'Beginner';
  return null;
}

/**
 * Gets a descriptive badge/title based on XP.
 * This function was originally from levelUtils.js (TypeScript).
 * @param {number} xp - The user's total experience points.
 * @returns {string|null} The descriptive badge/title, or null.
 */
function getLevelBadgeTitle(xp) {
  if (xp >= 5000) return '🏆 Elite Genius';
  if (xp >= 2000) return '👑 Master Scholar';
  if (xp >= 1000) return '🥇 Pro Learner';
  if (xp >= 500) return '🥈 Intermediate';
  if (xp >= 100) return '🥉 Beginner';
  return null; // Or a default like '🌱 Newcomer'
}

module.exports = {
  calculateLevel,
  getLevelName,
  getLevelBadgeTitle,
};
