const mongoose = require("mongoose");

// Schema for tracking daily ad-hoc tasks like material completion or mock tests
// This was originally HabitTracker.js
const dailyTaskTrackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Will be src/users/user.model.js
    required: true
  },
  // Array of tasks or goals for a specific date
  // These are not necessarily linked to the predefined Habit templates
  tasks: [{ // Renamed from dailyGoals to tasks for clarity
    taskType: { // Renamed from 'type.type'
      type: String,
      enum: ["material_study", "mock_test_attempt", "question_practice", "custom_task"], // Added more types
      required: true,
    },
    description: String, // Optional description for the task
    referenceId: { // Optional: ID of the material, mock test, question set etc.
        type: mongoose.Schema.Types.ObjectId
    },
    isCompleted: { // Renamed from 'completed'
        type: Boolean,
        default: false
    },
    completedAt: Date
  }],
  // The specific date this tracker document pertains to.
  // It's common to have one document per user per day for daily tracking.
  date: {
    type: Date,
    required: true
  }
}, { timestamps: true }); // adds createdAt, updatedAt

// Ensures one tracker document per user per day
dailyTaskTrackerSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyTaskTracker", dailyTaskTrackerSchema); // Renamed model export
