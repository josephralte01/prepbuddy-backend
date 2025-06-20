const mongoose = require("mongoose");

const habitRewardClaimSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["streak"], required: true },
  value: { type: Number, required: true }, // e.g. 3 (3-day streak)
  claimedAt: { type: Date, default: Date.now }
});

habitRewardClaimSchema.index({ user: 1, type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model("HabitRewardClaim", habitRewardClaimSchema);
