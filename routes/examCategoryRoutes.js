const express = require('express');
const router = express.Router();
const {
  getExamStructure,
} = require('../controllers/examCategoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:examId/structure', protect, getExamStructure);

module.exports = router;
