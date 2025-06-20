const { updateXPAndStreak } = require('../utils/xpUtils');
const XPLog = require('../models/XPLog');
const { trackChallengeProgress } = require('../utils/challengeTracker');

exports.markMaterialComplete = async (req, res) => {
  try {
    const userId = req.user._id;

    await updateXPAndStreak(userId, 20, 'study');
    await XPLog.create({
      user: userId,
      action: 'Study Material Completed',
      xpEarned: 20
    });

    await trackChallengeProgress(userId, 'completeStudyMaterial');

    res.json({ message: 'Marked as complete +20 XP' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete material' });
  }
};
