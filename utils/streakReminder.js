const User = require('../models/User');

exports.getUsersNeedingStreakReminder = async () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const users = await User.find({
    lastActiveDate: { $lt: yesterday },
  }).select('_id name email');

  return users;
};
