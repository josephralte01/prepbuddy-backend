const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { followUser, unfollowUser } = require('../controllers/followController');

router.post('/follow/:username', protect, followUser);
router.post('/unfollow/:username', protect, unfollowUser);

module.exports = router;
