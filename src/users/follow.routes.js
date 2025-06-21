const express = require('express');
const router = express.Router();
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const {
    followUser,
    unfollowUser,
    getFollowers,  // Optional new route
    getFollowing   // Optional new route
} = require('./follow.controller.js'); // Updated path

// All follow/unfollow actions require authentication
router.post('/:username/follow', authMiddleware, followUser);
router.post('/:username/unfollow', authMiddleware, unfollowUser);

// Optional: Routes to get followers/following lists (publicly accessible or auth-protected based on needs)
// These are typically public or semi-public. For now, let's make them public.
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);


module.exports = router;
