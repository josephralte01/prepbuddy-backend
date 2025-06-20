// === controllers/challengeInviteController.js ===
const ChallengeInvite = require('../models/ChallengeInvite');
const User = require('../models/User');

exports.createInvite = async (req, res) => {
  try {
    const { type, participantIds, goalXP } = req.body;

    const invite = await ChallengeInvite.create({
      type,
      goalXP,
      createdBy: req.user._id,
      participants: participantIds.map((id) => ({ user: id }))
    });

    res.status(201).json(invite);
  } catch (err) {
    console.error('Error creating challenge:', err);
    res.status(500).json({ message: 'Failed to create challenge' });
  }
};

exports.getMyChallenges = async (req, res) => {
  try {
    const challenges = await ChallengeInvite.find({
      'participants.user': req.user._id
    }).populate('createdBy', 'name username').populate('participants.user', 'name username');

    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch challenges' });
  }
};

exports.respondToInvite = async (req, res) => {
  try {
    const { challengeId, response } = req.body; // response = 'accepted' or 'rejected'
    const challenge = await ChallengeInvite.findById(challengeId);

    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const participant = challenge.participants.find(p => p.user.toString() === req.user._id.toString());
    if (!participant) return res.status(403).json({ message: 'You are not part of this challenge' });

    participant.status = response;
    if (response === 'accepted') participant.joinedAt = new Date();

    await challenge.save();
    res.json({ message: `Challenge ${response}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update challenge response' });
  }
};
