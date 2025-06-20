const User = require("../models/User");
const HabitTracker = require("../models/HabitTracker");
const HabitRewardClaim = require("../models/HabitRewardClaim");
const { updateXPAndStreak } = require("../utils/xpUtils");

exports.getDailyHabits = async (req, res) => {
  const today = new Date().toDateString();
  let habits = await HabitTracker.findOne({ user: req.user._id, date: today });

  if (!habits) {
    habits = await HabitTracker.create({
      user: req.user._id,
      date: today,
      dailyGoals: [
        { type: "material" },
        { type: "mock_test" }
      ]
    });
  }

  const user = await User.findById(req.user._id).select("xp streak");
  const claimed = await HabitRewardClaim.find({ user: req.user._id, type: "streak" });
  const claimedValues = claimed.map(c => c.value);

  res.json({
    dailyGoals: habits.dailyGoals,
    date: habits.date,
    xp: user.xp,
    streak: user.streak,
    rewardClaims: claimedValues
  });
};
