const express = require('express');
const router = express.Router();
// Paths relative to src/
const authMiddleware = require('./shared/middleware/authMiddleware.js');
const isAdmin = require('./shared/middleware/isAdmin.js');
const { getNotificationAnalytics } = require('./notificationAnalytics.controller.js');

// Route is already specific enough, e.g. /api/admin/analytics/notifications
// Or if mounted under /api/analytics, then /notifications
router.get('/', authMiddleware, isAdmin, getNotificationAnalytics);

module.exports = router;
