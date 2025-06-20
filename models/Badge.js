const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  xpRequired: { type: Number, required: true },
  icon: { type: String, required: true } // e.g. "/icons/bronze.svg"
});

module.exports = mongoose.model("Badge", badgeSchema);
