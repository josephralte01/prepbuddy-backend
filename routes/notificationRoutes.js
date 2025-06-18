const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  createGlobalNotification
} = require('../controllers/notificationController');

router.get('/', auth, getMyNotifications);
router.patch('/:id/read', auth, markAsRead);
router.post('/broadcast', auth, createGlobalNotification); // Admin only

module.exports = router;
