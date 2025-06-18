const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getSyllabus,
  getMaterials,
  getPYQs
} = require('../controllers/aiContentController');

// Authenticated routes only
router.post('/syllabus', auth, getSyllabus);
router.post('/materials', auth, getMaterials);
router.post('/pyqs', auth, getPYQs);

module.exports = router;
