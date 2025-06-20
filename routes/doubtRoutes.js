const express = require("express");
const router = express.Router();
const { askDoubt, getMyDoubts } = require("../controllers/doubtController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/ask", authMiddleware, askDoubt);
router.get("/", authMiddleware, getMyDoubts);

module.exports = router;
