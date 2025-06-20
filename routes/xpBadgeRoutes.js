// 📁 backend/routes/xpBadgeRoutes.js
const express = require('express');
const router = express.Router();
const { getBadges, createBadge, deleteBadge } = require('../controllers/xpBadgeController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, getBadges);
router.post('/', requireAdmin, createBadge);
router.delete('/:id', requireAdmin, deleteBadge);

module.exports = router;
