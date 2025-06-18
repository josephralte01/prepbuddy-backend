const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getGlobalLeaderboard } = require('../controllers/leaderboardController');

// Public or Authenticated (optional)
router.get('/', auth, getGlobalLeaderboard);

module.exports = router;
