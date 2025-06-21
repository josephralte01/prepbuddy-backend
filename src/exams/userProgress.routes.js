const express = require('express');
const router = express.Router();
// Paths relative to src/exams/
const {
    getUserProgressForExamCategory,
    markTopicAsCompleted,
    markMaterialAsCompletedInUserProgress, // For direct progress update on material
    logMockTestResult
} = require('./userProgress.controller.js');
const authMiddleware = require('../shared/middleware/authMiddleware.js'); // Corrected path

// All user progress routes require authentication
router.use(authMiddleware);

// Get a user's progress for a specific exam category
// e.g., GET /api/exams/progress/category/:examCategoryId  (assuming this router is mounted at /api/exams/progress)
router.get('/category/:examCategoryId', getUserProgressForExamCategory);

// Mark a topic as completed within an exam category
// e.g., POST /api/exams/progress/category/:examCategoryId/topic/:topicId/complete
router.post('/category/:examCategoryId/topic/:topicId/complete', markTopicAsCompleted);

// Mark a material as completed within an exam category's progress
// e.g., POST /api/exams/progress/category/:examCategoryId/material/:materialId/complete
router.post('/category/:examCategoryId/material/:materialId/complete', markMaterialAsCompletedInUserProgress);

// Log a result for a mock test within an exam category
// e.g., POST /api/exams/progress/category/:examCategoryId/mock-test/:mockTestId/log-result
router.post('/category/:examCategoryId/mock-test/:mockTestId/log-result', logMockTestResult);


// The original generic CRUD routes (POST /, GET /, GET /:id, PUT /:id, DELETE /:id)
// for UserProgress documents are not directly mapped here as they are less semantically clear
// for user actions. Admin-level CRUD for UserProgress documents would need separate, admin-protected routes if required.

module.exports = router;
