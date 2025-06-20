export function getLevelBadge(xp: number) {
  if (xp >= 5000) return '🏆 Elite Genius';
  if (xp >= 2000) return '👑 Master Scholar';
  if (xp >= 1000) return '🥇 Pro Learner';
  if (xp >= 500) return '🥈 Intermediate';
  if (xp >= 100) return '🥉 Beginner';
  return null;
}
