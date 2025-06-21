// === routes/mockTestRoutes.js ===
const express = require('express');
const router = express.Router();
const mockTestController = require('./mockTest.controllers.js'); // Updated path
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
// const { mockTestSchema } = require('./mockTest.validation.js'); // Validation schema
// const validate = require('../../shared/middleware/validate.js'); // Validation middleware
// Note: Validation was not previously applied in the original route file. Adding it now would be a new feature.
// For now, sticking to refactoring existing structure. Will address validation consistency in a later step if needed.


const isAdmin = require('../../shared/middleware/isAdmin.js'); // Import isAdmin
// const { mockTestSchema } = require('./mockTest.validation.js'); // Validation schema
// const validate = require('../../shared/middleware/validate.js'); // Validation middleware


// Apply protection to all routes below
router.use(authMiddleware); // Ensures user is authenticated

// Admin routes for CRUD operations on MockTests
router.post('/', isAdmin, /* validate(mockTestSchema), */ mockTestController.createMockTest);
router.put('/:id', isAdmin, /* validate(mockTestSchema), */ mockTestController.updateMockTest);
router.delete('/:id', isAdmin, mockTestController.deleteMockTest);

// Authenticated user routes (can view tests)
router.get('/', mockTestController.getAllMockTests);
router.get('/:id', mockTestController.getMockTestById);
// Example route for getting test with questions, if needed:
// router.get('/:id/with-questions', mockTestController.getMockTestWithQuestions);


module.exports = router;
