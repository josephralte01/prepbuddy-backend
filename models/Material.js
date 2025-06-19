// === models/Material.js ===
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  },
  bulletPoints: {
    type: [String],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
