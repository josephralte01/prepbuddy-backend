const express = require('express');
const router = express.Router();
// Paths relative to src/
const { search } = require('./search.controller.js');
const authMiddleware = require('./shared/middleware/authMiddleware.js');
// const validate = require('./shared/middleware/validate.js');
// const { searchSchema } = require('./search.validation.js'); // If search query params need validation

// Search is generally available to authenticated users.
// No specific Joi validation added for query params here, but can be if needed.
router.get('/', authMiddleware, /* validate(searchSchema), */ search);

module.exports = router;
