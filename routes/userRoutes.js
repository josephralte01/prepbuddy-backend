const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPublicProfile,
  updateUsername
} = require('../controllers/userController');

// ✅ Public profile route (no auth required)
router.get('/public/:username', getPublicProfile);

// ✅ Update username (auth required)
router.put('/me/username', protect, updateUsername);

// ✅ Streak reminder check (auth required)
router.get('/me/streak-reminder', protect, async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toDateString();
    const lastActive = new Date(user.lastActiveDate).toDateString();
    const needsReminder = lastActive !== today;
    res.json({ needsReminder });
  } catch (err) {
    res.status(500).json({ message: 'Error checking streak status' });
  }
});

module.exports = router;
