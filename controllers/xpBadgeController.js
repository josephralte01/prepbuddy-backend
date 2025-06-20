// === prepbuddy-backend/controllers/xpBadgeController.js ===
const XPBadge = require('../models/XPBadge');

exports.createXPBadge = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    const badge = await XPBadge.create(req.body);
    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllXPBadges = async (req, res) => {
  try {
    const badges = await XPBadge.find().sort({ xpThreshold: 1 });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteXPBadge = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    await XPBadge.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === prepbuddy-backend/routes/xpBadgeRoutes.js ===
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createXPBadge,
  getAllXPBadges,
  deleteXPBadge,
} = require('../controllers/xpBadgeController');

router.post('/', auth, createXPBadge);
router.get('/', auth, getAllXPBadges);
router.delete('/:id', auth, deleteXPBadge);

module.exports = router;
