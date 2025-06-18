const express = require('express');
const router = express.Router();
const { 
  createTopic, 
  getAllTopics, 
  getTopic, 
  updateTopic, 
  deleteTopic 
} = require('../controllers/topicController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const validate = require('../middleware/validate');
const { topicSchema } = require('../validations/topicValidation');

// Public routes
router.get('/', getAllTopics);
router.get('/:id', getTopic);

// Protected admin routes with validation
router.post('/', auth, isAdmin, validate(topicSchema), createTopic);
router.patch('/:id', auth, isAdmin, validate(topicSchema), updateTopic);
router.delete('/:id', auth, isAdmin, deleteTopic);

module.exports = router;