const express = require('express');
const router = express.Router();
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const {
  getSyllabus,
  getMaterials,
  getPYQs
} = require('./ai.controllers.js'); // Updated path

// Authenticated routes only
router.post('/syllabus', authMiddleware, getSyllabus);
router.post('/materials', authMiddleware, getMaterials);
router.post('/pyqs', authMiddleware, getPYQs);

module.exports = router;
