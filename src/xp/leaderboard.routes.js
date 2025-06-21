const express = require("express");
const router = express.Router();
const {
    getLeaderboard,
    getCurrentUserRank
} = require("./leaderboard.controller.js"); // Path relative to src/xp/
const authMiddleware = require("../../shared/middleware/authMiddleware.js"); // Path relative to src/xp/

// Public leaderboard, but authMiddleware can be used if needed to personalize (e.g., show user's rank highlighted)
// For now, assume auth is beneficial to get req.user for context, even if data is public.
router.get("/", authMiddleware, getLeaderboard);

// Get current user's rank
router.get("/my-rank", authMiddleware, getCurrentUserRank);


module.exports = router;
