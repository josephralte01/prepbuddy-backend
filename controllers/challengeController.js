// === backend/controllers/challengeController.js ===
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const challengeSocketEvents = require('../utils/challengeSocketEvents');

exports.createChallenge = async (req, res) => {
  try {
    const { opponentId, type } = req.body;
    const challengerId = req.user._id;

    const newChallenge = await Challenge.create({
      challenger: challengerId,
      opponent: opponentId,
      type,
      status: 'pending',
    });

    // Emit invite to opponent
    const io = req.app.get('io');
    challengeSocketEvents(io).emitChallengeInvite(opponentId, {
      from: challengerId,
      challengeId: newChallenge._id,
    });

    res.status(201).json(newChallenge);
  } catch (err) {
    console.error('Create challenge error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
