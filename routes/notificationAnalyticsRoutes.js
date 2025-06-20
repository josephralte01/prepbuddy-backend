const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getNotificationAnalytics } = require('../controllers/notificationAnalyticsController');

router.get('/admin/notification-analytics', auth, getNotificationAnalytics);

module.exports = router;
