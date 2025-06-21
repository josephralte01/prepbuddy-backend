const express = require('express');
const router = express.Router();
// Paths relative to src/
const {
  getMaterialById,
  completeMaterial,
  getAllMaterials,    // New public route
  createMaterial,     // New admin route
  updateMaterial,     // New admin route
  deleteMaterial      // New admin route
} = require('./material.controller.js');
const authMiddleware = require('./shared/middleware/authMiddleware.js');
const isAdmin = require('./shared/middleware/isAdmin.js');
// const validate = require('./shared/middleware/validate.js');
// const { materialSchema } = require('./material.validation.js'); // If validation is added

// Public route to get all materials (filterable, paginated)
router.get('/', getAllMaterials);

// Public route to get a specific material
router.get('/:id', getMaterialById); // authMiddleware could be added if only logged-in users can view

// Authenticated route for a user to mark material as complete
router.post('/:id/complete', authMiddleware, completeMaterial);

// --- Admin Routes for Material Management ---
router.post('/admin', authMiddleware, isAdmin, /* validate(materialSchema), */ createMaterial);
router.put('/admin/:id', authMiddleware, isAdmin, /* validate(materialSchema), */ updateMaterial);
router.delete('/admin/:id', authMiddleware, isAdmin, deleteMaterial);

module.exports = router;
