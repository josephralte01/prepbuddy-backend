const express = require("express");
const router = express.Router();
// Paths relative to src/
const {
    askDoubt,
    getMyDoubts,
    getDoubtById,           // New controller function
    rateDoubtAnswer,        // New controller function
    escalateDoubtToMentor   // New controller function
} = require("./doubt.controller.js");
const authMiddleware = require("./shared/middleware/authMiddleware.js");
// const validate = require('./shared/middleware/validate.js');
// const { askDoubtSchema, rateAnswerSchema } = require('./users/doubt.validation.js'); // Assuming validation lives in users or a shared space

// All doubt routes require authentication
router.use(authMiddleware);

// Ask a new doubt (to be answered by AI)
router.post("/ask", /* validate(askDoubtSchema), */ askDoubt);

// Get all doubts submitted by the current user
router.get("/", getMyDoubts);

// Get a specific doubt by its ID
router.get("/:id", getDoubtById);

// Rate the AI's answer for a doubt
router.patch("/:id/rate", /* validate(rateAnswerSchema), */ rateDoubtAnswer);

// Escalate a doubt to a human mentor
router.post("/:id/escalate", escalateDoubtToMentor);

// TODO: Routes for mentors to view/answer escalated doubts (likely under an admin/mentor scope)

module.exports = router;
