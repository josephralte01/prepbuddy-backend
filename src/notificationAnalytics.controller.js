// Path relative to src/
const NotificationLog = require('./notificationLog.model.js');

exports.getNotificationAnalytics = async (req, res) => {
  try {
    // Admin role check is handled by isAdmin middleware on the route

    const totalLogs = await NotificationLog.countDocuments();

    // Count by type
    const typeCounts = await NotificationLog.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    // Count by channel
    const channelCounts = await NotificationLog.aggregate([
        { $group: { _id: "$channel", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    // Count by status
    const statusCounts = await NotificationLog.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    // Recent logs (last 100, with user populated if exists)
    const recentLogs = await NotificationLog.find()
      .sort({ createdAt: -1 }) // Use createdAt from timestamps
      .limit(100)
      .populate('user', 'username name email') // Populate user if present
      .lean();

    res.status(200).json({
        summary: {
            totalLogs,
            byType: typeCounts,
            byChannel: channelCounts,
            byStatus: statusCounts
        },
        recentLogs
    });
  } catch (err) {
    console.error("Error fetching notification analytics:", err);
    res.status(500).json({ message: 'Error fetching notification analytics.', error: err.message });
  }
};
