const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter', // If Chapter is a model; otherwise, use just String
    required: true,
  },
  bulletPoints: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Material', materialSchema);
