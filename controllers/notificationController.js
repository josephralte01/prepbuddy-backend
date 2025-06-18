const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { toUser: req.user.userId },
        { toUser: null } // global
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Marked as read." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGlobalNotification = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can broadcast notifications." });
    }

    const { title, message } = req.body;
    const notification = await Notification.create({ title, message, toUser: null });
    res.status(201).json({ message: "Notification sent.", data: notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
v