const XPLog = require('./xpLog.model.js'); // Updated path
const User = require('../../users/user.model.js'); // Future path for User model

exports.getXPLogs = async (req, res) => {
  try {
    const {
      userId,
      action, // Changed from actionType for consistency with model
      minXP,
      maxXP,
      startDate,
      endDate,
      sortBy = 'createdAt', // Consistent with model field name
      order = 'desc',
    } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (action) filter.action = action; // Changed from actionType
    if (minXP || maxXP) filter.xpEarned = {}; // Changed from xp
    if (minXP) filter.xpEarned.$gte = parseInt(minXP); // Changed from xp
    if (maxXP) filter.xpEarned.$lte = parseInt(maxXP); // Changed from xp
    if (startDate || endDate) filter.createdAt = {}; // Consistent with model field name
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
    } else { // all-time
      startDate = new Date(0);
    }

    const topUsers = await XPLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } }, // Consistent with model
      {
        $group: {
          _id: '$user',
          totalXP: { $sum: '$xpEarned' }, // Consistent with model
        },
      },
      { $sort: { totalXP: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users', // Mongoose pluralizes model names for collections
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
          streak: '$userDetails.streak', // Assuming streak is on User model
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
    const { userId, xp, action, reason } = req.body; // Changed actionType to action

    if (!userId || !xp || !action || !reason) { // Changed actionType to action
      return res.status(400).json({ message: 'Missing required fields: userId, xp, action, reason' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.xp = (user.xp || 0) + parseInt(xp); // Ensure user.xp is initialized if not present
    await user.save();

    await XPLog.create({
      user: user._id,
      xpEarned: parseInt(xp), // Consistent with model
      action: action, // Consistent with model
      metadata: { reason, source: 'manual-adjustment' },
    });

    res.status(200).json({ message: 'XP adjusted successfully' });
  } catch (error) {
    console.error('Error adjusting XP manually:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
