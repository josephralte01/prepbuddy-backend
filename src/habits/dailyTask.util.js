const DailyTaskTracker = require('./dailyTaskTracker.model.js'); // Updated path and model name
const { awardXP } = require('../xp/xpUtils.js'); // Using the consolidated awardXP

/**
 * Updates a user's daily tasks, marking a specific task type as completed for the day.
 * If all predefined daily tasks for the user are completed, awards bonus XP.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} taskTypeToComplete - The type of task completed (e.g., 'material_study', 'mock_test_attempt', 'login_app').
 * @param {object} [options={}] - Optional parameters.
 * @param {string} [options.description] - Optional description for the completed task.
 * @param {string} [options.referenceId] - Optional reference ID for the task.
 */
async function completeDailyTask(userId, taskTypeToComplete, options = {}) {
  const today = new Date();
  const dateKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Normalized date for DB query

  let tracker = await DailyTaskTracker.findOne({ user: userId, date: dateKey });

  if (!tracker) {
    tracker = await DailyTaskTracker.create({
        user: userId,
        date: dateKey,
        tasks: [] // Initialize with empty tasks array
    });
  }

  // Find if this task type already exists for today
  let taskEntry = tracker.tasks.find(task => task.taskType === taskTypeToComplete);

  if (taskEntry) {
    if (!taskEntry.isCompleted) {
      taskEntry.isCompleted = true;
      taskEntry.completedAt = new Date();
      if(options.description) taskEntry.description = options.description;
      if(options.referenceId) taskEntry.referenceId = options.referenceId;
    } else {
      // Task already completed today, do nothing or log a message
      // console.log(`Task ${taskTypeToComplete} already completed today for user ${userId}.`);
      return tracker; // Return early
    }
  } else {
    // Add new task entry if it doesn't exist
    tracker.tasks.push({
      taskType: taskTypeToComplete,
      isCompleted: true,
      completedAt: new Date(),
      description: options.description,
      referenceId: options.referenceId
    });
  }

  // Logic for "all daily habits completed" bonus (if applicable)
  // This requires defining what "all daily habits" means.
  // For example, if there's a predefined list of essential daily tasks.
  // Let's assume for now there's a list of 'coreDailyTaskTypes'
  const coreDailyTaskTypes = ['material_study', 'mock_test_attempt', 'login_app']; // Example
  let allCoreTasksDoneToday = true;
  for (const coreTask of coreDailyTaskTypes) {
      if (!tracker.tasks.find(t => t.taskType === coreTask && t.isCompleted)) {
          allCoreTasksDoneToday = false;
          break;
      }
  }

  if (allCoreTasksDoneToday) {
      // Check if this "all tasks completed" bonus was already awarded today
      // This might need a flag on the DailyTaskTracker model, e.g., `dailyBonusAwarded: Boolean`
      if (!tracker.dailyBonusAwarded) { // Assuming 'dailyBonusAwarded' field exists or is added
        await awardXP(userId, 20, 'all_daily_tasks_completed_bonus', tracker._id, { date: dateKey });
        // tracker.dailyBonusAwarded = true; // Mark bonus as awarded
      }
  }

  await tracker.save();
  return tracker;
}

module.exports = { completeDailyTask };
