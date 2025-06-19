// === routes/userProgressRoutes.js ===
const express = require('express');
const router = express.Router();
const userProgressController = require('../controllers/userProgressController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Apply protection to all routes below
router.use(isAuthenticated);

router.post('/', userProgressController.createUserProgress);
router.get('/', userProgressController.getAllUserProgress);
router.get('/:id', userProgressController.getUserProgressById);
router.put('/:id', userProgressController.updateUserProgress);
router.delete('/:id', userProgressController.deleteUserProgress);

module.exports = router;
