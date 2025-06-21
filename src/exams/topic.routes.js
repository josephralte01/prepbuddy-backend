const express = require('express');
const router = express.Router();
const {
  createTopic,
  getAllTopics,
  getTopic,
  updateTopic,
  deleteTopic
} = require('./topic.controllers.js'); // Updated path
const authMiddleware = require('../../shared/middleware/authMiddleware.js'); // Updated path
const isAdmin = require('../../shared/middleware/isAdmin.js'); // Updated path
const validate = require('../../shared/middleware/validate.js'); // Updated path
const { topicSchema } = require('./topic.validation.js'); // Updated path

// Public routes
router.get('/', getAllTopics);
router.get('/:id', getTopic);

// Protected admin routes with validation
router.post('/', authMiddleware, isAdmin, validate(topicSchema), createTopic);
router.patch('/:id', authMiddleware, isAdmin, validate(topicSchema), updateTopic);
router.delete('/:id', authMiddleware, isAdmin, deleteTopic);

module.exports = router;
