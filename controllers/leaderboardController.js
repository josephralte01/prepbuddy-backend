const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const topUsers = await UserProgress.aggregate([
      { $unwind: "$mockTestResults" },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$mockTestResults.score" },
          avgAccuracy: { $avg: "$mockTestResults.accuracy" }
        }
      },
      {
        $sort: { totalScore: -1, avgAccuracy: -1 }
      },
      { $limit: 20 }
    ]);

    const enriched = await Promise.all(topUsers.map(async (entry) => {
      const user = await User.findById(entry._id).select("name email subscriptionTier");
      return {
        userId: entry._id,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        totalScore: entry.totalScore,
        avgAccuracy: entry.avgAccuracy
      };
    }));

    res.status(200).json({ leaderboard: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
