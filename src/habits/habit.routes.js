const express = require("express");
const router = express.Router();
const {
    // Daily Ad-hoc Tasks
    getDailyTasks,
    completeDailyTaskController,
    // Predefined Habits
    getHabitTemplates,
    startUserHabit,
    completePredefinedHabit,
    getUserHabitProgressList,
    pauseUserHabit
} = require("./habit.controller.js"); // Updated path
const authMiddleware = require("../../shared/middleware/authMiddleware.js"); // Updated path

// All habit routes require authentication
router.use(authMiddleware);

// --- Routes for Daily Ad-hoc Tasks ---
// Gets the user's list of daily tasks for today (e.g., study material, attempt mock test)
router.get("/daily-tasks", getDailyTasks);
// Marks a specific daily task as complete
router.post("/daily-tasks/complete", completeDailyTaskController);


// --- Routes for Predefined Habit Templates & User Progress on Them ---
// Get list of all available predefined habit templates
router.get("/templates", getHabitTemplates);

// User starts or reactivates a predefined habit from a template
router.post("/user-progress/start", startUserHabit);
// User marks an occurrence of a predefined habit as complete
router.post("/user-progress/complete", completePredefinedHabit); // Needs habitProgressId in body
// Get all active habit progress for the current user
router.get("/user-progress", getUserHabitProgressList);
// User pauses tracking a predefined habit
router.put("/user-progress/pause", pauseUserHabit); // Needs habitProgressId in body, PUT for state change


// TODO: Routes for HabitRewardClaim if manual claiming is a feature,
// or if specific reward info needs to be fetched.
// e.g., GET /rewards/claimed

module.exports = router;
