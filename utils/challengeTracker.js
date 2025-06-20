// === utils/challengeTracker.js ===
const axios = require('axios');
const UserChallengeProgress = require('../models/UserChallengeProgress');
const Challenge = require('../models/Challenge');

exports.trackChallengeProgress = async (userId, field, increment = 1) => {
  try {
    const activeChallenges = await Challenge.find({ isActive: true });
    const relevant = activeChallenges.filter((c) => c.criteria?.[field]);

    for (const challenge of relevant) {
      await axios.post(
        `${process.env.SERVER_URL || 'http://localhost:5000'}/api/challenges/progress`,
        { challengeId: challenge._id, field, increment },
        { headers: { Cookie: `token=dummy` }, withCredentials: true } // Replace this if internal
      );
    }
  } catch (err) {
    console.error('Challenge tracking failed:', err);
  }
};
