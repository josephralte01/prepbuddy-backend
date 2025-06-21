// Path relative to src/
const Notification = require('./notification.model.js');

// Get notifications for the currently logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20; // Default to 20 notifications per page
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for performance if not modifying

    const totalNotifications = await Notification.countDocuments({ user: userId });
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });


    res.status(200).json({
      notifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      totalNotifications,
      unreadCount
    });
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications.', error: err.message });
  }
};

// Mark a specific notification as read
exports.markNotificationAsRead = async (req, res) => { // Renamed from markAsRead
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId }, // Ensure user owns the notification
      { isRead: true, readAt: new Date() },
      { new: true } // Return the updated document
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or not owned by user.' });
    }
    res.status(200).json({ message: 'Notification marked as read.', notification });
  } catch (err) {
    console.error('Failed to update notification:', err);
    res.status(500).json({ message: 'Failed to update notification.', error: err.message });
  }
};

// Mark all unread notifications for the user as read
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await Notification.updateMany(
            { user: userId, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );
        res.status(200).json({ message: `${result.modifiedCount} notifications marked as read.` });
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        res.status(500).json({ message: 'Failed to mark all notifications as read.', error: error.message });
    }
};

// (Internal) Service function to create a notification - not directly an API endpoint
// This would be called by other services/controllers when an event occurs.
// Example: awardXP in xpUtils.js could call this.
// const createNotification = async (notificationData) => {
//   try {
//     const notification = await Notification.create(notificationData);
//     // Emit via socket to the user
//     // const io = getIO(); // Function to get global IO instance
//     // if (io && notificationData.user) {
//     //   io.to(notificationData.user.toString()).emit('notification:new', notification);
//     // }
//     return notification;
//   } catch (error) {
//     console.error("Error creating notification:", error);
//     // Handle error appropriately, maybe log to a more robust system
//   }
// };
// module.exports.createNotificationService = createNotification; // If exporting as a service

// Placeholder for deleting a notification (user action)
exports.deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;
        const result = await Notification.deleteOne({ _id: notificationId, user: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Notification not found or not owned by user." });
        }
        res.status(200).json({ message: "Notification deleted." });
    } catch (error) {
        console.error('Failed to delete notification:', error);
        res.status(500).json({ message: 'Failed to delete notification.', error: error.message });
    }
};
