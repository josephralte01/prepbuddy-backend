const express = require('express');
const router = express.Router();
const {
  getMaterialById,
  completeMaterial,
} = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id', protect, getMaterialById);
router.post('/:id/complete', protect, completeMaterial);

module.exports = router;
