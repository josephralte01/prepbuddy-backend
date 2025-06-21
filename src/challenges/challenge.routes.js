const express = require('express');
const router = express.Router();
const {
    // Challenge Templates
    createChallengeTemplate,
    getChallengeTemplates,
    // Challenge Invites
    createChallengeInvite,
    respondToChallengeInvite,
    getUserChallenges, // Gets user's active/pending challenge invites
    // User Challenge Progress (on templates)
    getUserChallengeProgress, // Gets progress for a specific user on a specific challenge template
    getAllUserProgressEntries, // Gets all progress entries for a user
    // recordProgressViaApi // Decided against exposing this as a direct API route, should be internal calls
} = require('./challenge.controller.js');
const authMiddleware = require('../../shared/middleware/authMiddleware.js');
const isAdmin = require('../../shared/middleware/isAdmin.js');

// --- Routes for Challenge Templates (Predefined Challenges) ---
// Admin can create challenge templates
router.post('/templates', authMiddleware, isAdmin, createChallengeTemplate);
// Users can get available challenge templates
router.get('/templates', authMiddleware, getChallengeTemplates);
// TODO: Add routes for admin to GET /templates/:id, PUT /templates/:id, DELETE /templates/:id if needed


// --- Routes for Challenge Invites (User-initiated challenges) ---
// User creates a new challenge invite
router.post('/invites', authMiddleware, createChallengeInvite);
// User gets their list of challenge invites (pending, active, etc.)
router.get('/invites/my-challenges', authMiddleware, getUserChallenges); // Renamed from '/mine' for clarity
// User responds to a specific challenge invite
router.post('/invites/:inviteId/respond', authMiddleware, respondToChallengeInvite); // inviteId in params


// --- Routes for User Progress on Challenge Templates ---
// Get current user's progress on a specific challenge template
router.get('/progress/:challengeId', authMiddleware, getUserChallengeProgress); // challengeId is template ID
// Get all challenge progress entries for a user (or specific user if admin)
router.get('/progress/user/:userId?', authMiddleware, getAllUserProgressEntries); // userId is optional, defaults to self


// The old '/api/challenges/progress' POST route used by challengeTracker.js is not recreated here.
// Progress updates should happen via direct internal function calls within services/utils
// (e.g., trackChallengeProgress / updateUserChallengeProgress in challengeTracker.util.js)
// after relevant game events (e.g., completing a mock test).

module.exports = router;
