const { updateXPAndStreak } = require('../utils/xpUtils');
const XPLog = require('../models/XPLog');
const { trackChallengeProgress } = require('../utils/challengeTracker');

exports.submitMockTestSession = async (req, res) => {
  try {
    const session = await MockTestSession.findById(req.params.id);
    if (!session || session.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Session not found or unauthorized' });
    }

    if (session.isSubmitted) {
      return res.status(400).json({ message: 'Already submitted' });
    }

    session.answers = req.body.answers;
    session.score = req.body.score;
    session.isSubmitted = true;
    session.submittedAt = new Date();
    await session.save();

    await updateXPAndStreak(req.user._id, 30, 'mockTest');
    await XPLog.create({
      user: req.user._id,
      action: 'Mock Test Submitted',
      xpEarned: 30
    });

    await trackChallengeProgress(req.user._id, 'completeMockTests');

    res.json({ message: 'Test submitted +30 XP' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting test' });
  }
};
