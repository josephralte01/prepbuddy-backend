const express = require('express');
const router = express.Router();
// Paths relative to src/
const {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead, // New controller function
    deleteNotification          // New controller function
} = require('./notification.controller.js');
const authMiddleware = require('./shared/middleware/authMiddleware.js');

// All notification routes require authentication
router.use(authMiddleware);

// Get current user's notifications (paginated)
router.get('/', getMyNotifications); // Changed from /me to / for consistency

// Mark all notifications as read for the current user
router.post('/mark-all-read', markAllNotificationsAsRead);

// Mark a specific notification as read
router.patch('/:id/read', markNotificationAsRead);

// Delete a specific notification
router.delete('/:id', deleteNotification);


module.exports = router;
