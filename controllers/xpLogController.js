const XPLog = require('../models/XPLog');
const User = require('../models/User');

exports.getXPLogs = async (req, res) => {
  try {
    const {
      userId,
      actionType,
      minXP,
      maxXP,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (actionType) filter.actionType = actionType;
    if (minXP || maxXP) filter.xp = {};
    if (minXP) filter.xp.$gte = parseInt(minXP);
    if (maxXP) filter.xp.$lte = parseInt(maxXP);
    if (startDate || endDate) filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);

    const xpLogs = await XPLog.find(filter)
      .populate('user', 'name email')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

    res.status(200).json(xpLogs);
  } catch (error) {
    console.error('Error fetching XP logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTopXPEarners = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

    const now = new Date();
    let startDate;
    if (period === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(0); // all-time
    }

    const topUsers = await XPLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$user',
          totalXP: { $sum: '$xp' },
        },
      },
      { $sort: { totalXP: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          userId: '$_id',
          name: '$userDetails.name',
          email: '$userDetails.email',
          totalXP: 1,
          streak: '$userDetails.streak',
        },
      },
    ]);

    res.status(200).json(topUsers);
  } catch (error) {
    console.error('Error fetching top XP earners:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.manualAdjustXP = async (req, res) => {
  try {
    const { userId, xp, actionType, reason } = req.body;

    if (!userId || !xp || !actionType || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.xp += xp;
    await user.save();

    await XPLog.create({
      user: user._id,
      xp,
      actionType,
      metadata: { reason, source: 'manual-adjustment' },
    });

    res.status(200).json({ message: 'XP adjusted successfully' });
  } catch (error) {
    console.error('Error adjusting XP manually:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
