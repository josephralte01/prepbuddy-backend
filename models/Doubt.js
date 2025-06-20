const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  aiAnswer: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Doubt", doubtSchema);
