const express = require('express');
const router = express.Router();
const {
  getExamStructure,
} = require('./examCategory.controllers.js'); // Updated path
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path

router.get('/:examId/structure', authMiddleware, getExamStructure);

module.exports = router;
