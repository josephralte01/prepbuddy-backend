const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyNotifications);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
