const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  dailyGoals: [{
    type: {
      type: String,
      enum: ["material", "mock_test"],
      required: true,
    },
    completed: { type: Boolean, default: false },
  }],
  date: { type: Date, required: true }
});

module.exports = mongoose.model("HabitTracker", habitSchema);
