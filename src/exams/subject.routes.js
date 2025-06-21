const express = require('express');
const router = express.Router();
const {
  createSubject,
  getAllSubjects,
  getSubject,
  updateSubject,
  deleteSubject
} = require('./subject.controllers.js'); // Updated path
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const isAdmin = require('../../shared/middleware/isAdmin.js'); // Updated path
const validate = require('../../shared/middleware/validate.js'); // Updated path
const { subjectSchema } = require('./subject.validation.js'); // Updated path

// Public routes
router.get('/', getAllSubjects);
router.get('/:id', getSubject);

// Protected admin routes with validation
router.post('/', authMiddleware, isAdmin, validate(subjectSchema), createSubject);
router.patch('/:id', authMiddleware, isAdmin, validate(subjectSchema), updateSubject);
router.delete('/:id', authMiddleware, isAdmin, deleteSubject);

module.exports = router;
