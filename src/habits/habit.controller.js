const User = require('../../users/user.model.js'); // Updated path
const DailyTaskTracker = require('./dailyTaskTracker.model.js'); // Updated path and name
const HabitRewardClaim = require('./habitRewardClaim.model.js'); // Updated path
const Habit = require('./habit.model.js'); // For predefined habits
const UserHabitProgress = require('./userHabitProgress.model.js'); // For progress on predefined habits
const { completeDailyTask } = require('./dailyTask.util.js'); // Utility for daily tasks
// const { updateHabitProgress } = require('./habit.util.js'); // Placeholder for predefined habit progress util

// Controller for Daily Ad-hoc Tasks (from original HabitTracker logic)
exports.getDailyTasks = async (req, res) => {
  try {
    const today = new Date();
    const dateKey = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let tracker = await DailyTaskTracker.findOne({ user: req.user._id, date: dateKey });

    if (!tracker) {
      // Initialize with a default set of daily tasks if none exist for today
      // These default tasks can be configured elsewhere
      const defaultTasks = [
        { taskType: "material_study", description: "Study one piece of material" },
        { taskType: "mock_test_attempt", description: "Attempt a mock test" },
        { taskType: "login_app", description: "Log in to the app" } // Example of another daily task
      ];
      tracker = await DailyTaskTracker.create({
        user: req.user._id,
        date: dateKey,
        tasks: defaultTasks.map(task => ({ taskType: task.taskType, description: task.description, isCompleted: false }))
      });
    }

    const user = await User.findById(req.user._id).select('xp streak'); // Assuming streak is still on User model
    // Fetch claimed rewards relevant to daily tasks or general streaks if applicable
    // const claimedRewards = await HabitRewardClaim.find({ user: req.user._id /*, type: 'daily_task_streak_related' */});
    // const claimedValues = claimedRewards.map(c => c.value);

    res.status(200).json({
      dailyTasks: tracker.tasks,
      date: tracker.date,
      xp: user.xp,
      streak: user.streak, // This is user's general activity streak
      // rewardClaims: claimedValues // If relevant rewards are fetched
    });
  } catch (error) {
    console.error("Error in getDailyTasks:", error);
    res.status(500).json({ message: "Server error while fetching daily tasks." });
  }
};

// Mark a daily ad-hoc task as complete
exports.completeDailyTaskController = async (req, res) => {
  try {
    const { taskType, description, referenceId } = req.body;
    if (!taskType) {
      return res.status(400).json({ message: "Task type is required." });
    }
    // The completeDailyTask util handles XP awarding for "all daily tasks completed" bonus
    const tracker = await completeDailyTask(req.user._id, taskType, { description, referenceId });

    // Fetch updated user for current XP/streak to return
    const user = await User.findById(req.user._id).select('xp streak');

    res.status(200).json({
        message: `Task '${taskType}' marked as complete.`,
        dailyTasks: tracker.tasks,
        xp: user.xp,
        streak: user.streak
    });
  } catch (error) {
    console.error("Error in completeDailyTaskController:", error);
    res.status(500).json({ message: "Server error while completing daily task." });
  }
};


// --- Controllers for Predefined Habits (using Habit.model.js and UserHabitProgress.model.js) ---

// Get all active predefined habit templates
exports.getHabitTemplates = async (req, res) => {
    try {
        const habits = await Habit.find({ isActive: true }).sort('category title');
        res.status(200).json(habits);
    } catch (error) {
        console.error("Error fetching habit templates:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// User starts tracking a predefined habit
exports.startUserHabit = async (req, res) => {
    try {
        const { habitId } = req.body;
        const userId = req.user._id;

        const habitExists = await Habit.findById(habitId);
        if (!habitExists || !habitExists.isActive) {
            return res.status(404).json({ message: 'Habit template not found or not active.' });
        }

        let userHabitProgress = await UserHabitProgress.findOne({ user: userId, habit: habitId });
        if (userHabitProgress) {
            if (userHabitProgress.isActive) {
                return res.status(400).json({ message: 'You are already tracking this habit.' });
            }
            userHabitProgress.isActive = true; // Reactivate if previously paused
        } else {
            userHabitProgress = await UserHabitProgress.create({
                user: userId,
                habit: habitId,
                isActive: true
            });
        }
        await userHabitProgress.save();
        res.status(201).json({ message: `Started tracking habit: ${habitExists.title}`, progress: userHabitProgress });
    } catch (error) {
        console.error("Error starting user habit:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// User completes an instance of a predefined habit
exports.completePredefinedHabit = async (req, res) => {
    try {
        const { habitProgressId } = req.body; // ID of the UserHabitProgress document
        const userId = req.user._id;

        let progress = await UserHabitProgress.findOne({ _id: habitProgressId, user: userId, isActive: true })
            .populate('habit');

        if (!progress) {
            return res.status(404).json({ message: 'Active habit progress not found.' });
        }

        // TODO: Implement actual habit completion logic using a new habit.util.js function
        // This util would check frequency, update lastCompletedAt, streak, award XP, check for bonus rewards etc.
        // For now, just a placeholder:
        // progress = await updateHabitProgress(progress); // This function would contain the core logic

        // Placeholder response until util is built:
        progress.lastCompletedAt = new Date(); // Simplistic update
        progress.currentStreak = (progress.currentStreak || 0) + 1;
        await progress.save();
        await awardXP(userId, progress.habit.xpReward, 'habit_completed', progress.habit._id, { habitTitle: progress.habit.title });


        res.status(200).json({ message: `Habit '${progress.habit.title}' marked complete!`, progress });
    } catch (error) {
        console.error("Error completing predefined habit:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get user's progress for all their active predefined habits
exports.getUserHabitProgressList = async (req, res) => {
    try {
        const userId = req.user._id;
        const progressList = await UserHabitProgress.find({ user: userId, isActive: true })
            .populate('habit', 'title description frequency category');
        res.status(200).json(progressList);
    } catch (error) {
        console.error("Error fetching user habit progress list:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// User pauses a predefined habit
exports.pauseUserHabit = async (req, res) => {
    try {
        const { habitProgressId } = req.body;
        const userId = req.user._id;
        const progress = await UserHabitProgress.findOneAndUpdate(
            { _id: habitProgressId, user: userId },
            { isActive: false },
            { new: true }
        );
        if (!progress) return res.status(404).json({ message: "Habit progress not found."});
        res.status(200).json({ message: "Habit paused.", progress});
    } catch (error) {
        console.error("Error pausing habit:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// TODO: Add controller for HabitRewardClaim if manual claiming is needed, or integrate into habit completion logic.
