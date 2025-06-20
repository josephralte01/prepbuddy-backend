const HabitTracker = require('../models/HabitTracker');
const { updateXPAndStreak } = require('./xpUtils');

async function updateHabit(userId, action) {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const habit = await HabitTracker.findOneAndUpdate(
    { user: userId, date },
    { $setOnInsert: { user: userId, date } },
    { upsert: true, new: true }
  );

  if (action === 'study') habit.habits.studiedMaterial = true;
  if (action === 'mock') habit.habits.attemptedMockTest = true;
  if (action === 'login') habit.habits.loggedIn = true;

  // Check if all habits are done
  const allDone = Object.values(habit.habits).every(Boolean);
  if (allDone && !habit.completed) {
    habit.completed = true;
    await updateXPAndStreak(userId, 20, 'Completed all daily habits');
  }

  await habit.save();
}

module.exports = { updateHabit };
