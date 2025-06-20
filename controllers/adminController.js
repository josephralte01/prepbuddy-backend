const User = require('../models/User');
const Subscription = require('../models/Subscription');
const UserProgress = require('../models/UserProgress');
const ExamCategory = require('../models/ExamCategory');
const XPLog = require('../models/XPLog');

exports.getAdminStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admins only." });
    }

    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ subscriptionTier: 'premium' });
    const basicUsers = await User.countDocuments({ subscriptionTier: 'basic' });
    const freeUsers = await User.countDocuments({ subscriptionTier: 'free' });

    const totalRevenue = await Subscription.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$tier",
          count: { $sum: 1 },
          total: {
            $sum: {
              $cond: [
                { $eq: ["$tier", "premium"] }, 499,
                { $cond: [{ $eq: ["$tier", "basic"] }, 199, 0] }
              ]
            }
          }
        }
      }
    ]);

    const topScorers = await UserProgress.aggregate([
      { $unwind: "$mockTestResults" },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$mockTestResults.score" }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 5 }
    ]);

    const examCounts = await ExamCategory.aggregate([
      { $project: { name: 1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      users: {
        total: totalUsers,
        premium: premiumUsers,
        basic: basicUsers,
        free: freeUsers
      },
      revenue: totalRevenue,
      topScorers,
      exams: examCounts
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manualXPControl = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admins only." });
    }

    const { userId, xp, reason } = req.body;

    if (!userId || typeof xp !== 'number' || !reason) {
      return res.status(400).json({ error: 'userId, xp (number), and reason are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.xp = Math.max(0, user.xp + xp);
    await user.save();

    const log = new XPLog({
      userId,
      xp,
      action: 'Manual Adjustment',
      meta: { reason, admin: req.user._id }
    });
    await log.save();

    res.status(200).json({ message: 'XP updated successfully', newXP: user.xp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
