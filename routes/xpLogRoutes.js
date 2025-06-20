const express = require('express');
const router = express.Router();
const {
  getXPLogs,
  getTopXPEarners,
  manualAdjustXP,
} = require('../controllers/xpLogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getXPLogs);
router.get('/top-users', protect, adminOnly, getTopXPEarners);
router.post('/manual', protect, adminOnly, manualAdjustXP);

module.exports = router;
