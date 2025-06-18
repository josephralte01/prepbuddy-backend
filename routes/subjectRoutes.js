const express = require('express');
const router = express.Router();
const { 
  createSubject, 
  getAllSubjects, 
  getSubject, 
  updateSubject, 
  deleteSubject 
} = require('../controllers/subjectController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { subjectSchema } = require('../validations/subjectValidation');

// Public routes
router.get('/', getAllSubjects);
router.get('/:id', getSubject);

// Protected admin routes with validation
router.post('/', auth, isAdmin, validate(subjectSchema), createSubject);
router.patch('/:id', auth, isAdmin, validate(subjectSchema), updateSubject);
router.delete('/:id', auth, isAdmin, deleteSubject);

module.exports = router;