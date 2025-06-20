const express = require("express");
const router = express.Router();
const { getAvailableBadges, claimBadge } = require("../controllers/badgeController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getAvailableBadges);
router.post("/claim", authMiddleware, claimBadge);

module.exports = router;
