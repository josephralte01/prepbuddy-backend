const express = require("express");
const { getDailyHabits, completeHabit } = require("../controllers/habitController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", authMiddleware, getDailyHabits);
router.post("/complete", authMiddleware, completeHabit);

module.exports = router;
