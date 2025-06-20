// === utils/badgeUtils.js ===

function getHabitBadges(progressMap = {}) {
  const badges = [];
  const streaks = Object.values(progressMap).map((p: any) => p.streak || 0);

  if (streaks.some(s => s >= 7)) badges.push('🔁 7-day Habit Streak');
  if (streaks.some(s => s >= 30)) badges.push('🔥 30-day Habit Beast');

  return badges;
}

module.exports = {
  getHabitBadges,
};
