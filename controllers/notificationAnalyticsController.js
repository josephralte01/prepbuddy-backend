const NotificationLog = require('../models/NotificationLog');

exports.getNotificationAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Admins only." });

    const sentCount = await NotificationLog.countDocuments();
    const xpReminders = await NotificationLog.countDocuments({ type: 'xp_reminder' });
    const streakAlerts = await NotificationLog.countDocuments({ type: 'streak_reminder' });

    const recentLogs = await NotificationLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('user', 'name email');

    res.json({ sentCount, xpReminders, streakAlerts, recentLogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
