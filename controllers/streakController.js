// === backend/controllers/streakController.js ===
const User = require('../models/User');
const { logXPAction } = require('../utils/xpLogger');

exports.recoverStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const lastActive = new Date(user.lastActiveDate);
    const missedYesterday =
      now.getDate() - lastActive.getDate() === 1 &&
      now.getMonth() === lastActive.getMonth() &&
      now.getFullYear() === lastActive.getFullYear();

    if (!missedYesterday || user.streak >= 1) {
      return res.status(400).json({ error: 'No streak recovery needed' });
    }

    // Example: cost 50 XP
    if (user.xp < 50) {
      return res.status(400).json({ error: 'Not enough XP to recover streak' });
    }

    user.xp -= 50;
    user.streak = 1;
    user.lastActiveDate = now;
    await user.save();

    await logXPAction(user._id, {
      type: 'streak-recovered',
      amount: -50,
      note: 'Recovered streak using XP'
    });

    res.status(200).json({ message: 'Streak recovered', xp: user.xp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
