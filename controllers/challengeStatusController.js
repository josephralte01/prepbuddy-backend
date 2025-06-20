// === controllers/challengeStatusController.js ===
const ChallengeInvite = require('../models/ChallengeInvite');
const User = require('../models/User');

exports.getUserChallenges = async (req, res) => {
  try {
    const userId = req.user._id;

    const challenges = await ChallengeInvite.find({
      $or: [
        { creator: userId },
        { invitees: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('creator', 'username')
      .populate('invitees', 'username')
      .lean();

    res.json({ challenges });
  } catch (err) {
    console.error('Error fetching user challenges:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
