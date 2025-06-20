// === models/MockTestSession.js ===
const mongoose = require('mongoose');

const MockTestSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questions: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOption: String
    }
  ],
  score: Number,
  completed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date
});

module.exports = mongoose.model('MockTestSession', MockTestSessionSchema);
