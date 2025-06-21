const express = require('express');
const router = express.Router();
const {
  // Admin functions
  createBadge,
  getBadges,      // This can serve for admin listing all, or public listing if filtered
  getBadgeById,
  updateBadge,
  deleteBadge,
  // User functions
  getAvailableUserBadges,
  claimUserBadge
} = require('./badge.controller.js');
const authMiddleware = require('../../shared/middleware/authMiddleware.js');
const isAdmin = require('../../shared/middleware/isAdmin.js');

// --- Admin Routes for Badge Management ---
// All admin routes require authentication and admin role
router.post('/admin', authMiddleware, isAdmin, createBadge);
router.get('/admin', authMiddleware, isAdmin, getBadges); // Admin gets all badges, potentially unfiltered
router.get('/admin/:id', authMiddleware, isAdmin, getBadgeById);
router.put('/admin/:id', authMiddleware, isAdmin, updateBadge);
router.delete('/admin/:id', authMiddleware, isAdmin, deleteBadge);

// --- User-facing Routes ---
// Get all publicly available badges (and user's claim status)
router.get('/', authMiddleware, getAvailableUserBadges);
// User claims a badge
router.post('/claim', authMiddleware, claimUserBadge);

module.exports = router;
