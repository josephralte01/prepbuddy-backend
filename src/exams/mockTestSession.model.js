// === models/MockTestSession.js ===
const mongoose = require('mongoose');

const MockTestSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mockTest: { // Assuming this session is for a MockTest, not a chapter. Renaming chapterId
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest', // Referencing MockTest model
    required: true
  },
  questions: [
    {
      question: { // Renaming questionId to question for clarity
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question', // Referencing Question model
        required: true
      },
      selectedOptionIndex: { // Storing index of selected option
        type: Number
      },
      answerText: { // For open-ended or fill-in-the-blank, if applicable
        type: String
      },
      isCorrect: {
        type: Boolean
      },
      status: { // e.g., 'answered', 'not_answered', 'skipped'
        type: String,
        enum: ['answered', 'not_answered', 'skipped', 'marked_for_review'],
        default: 'not_answered'
      }
    }
  ],
  answers: [ // Storing the user's answers in a more structured way
    // Example structure: { questionId: ObjectId, selectedOptionId: ObjectId (or text/index) }
    // This can be flexible based on how answers are processed and stored.
    // For simplicity, if answers are simple, the `questions` array above might be enough.
    // If more detail is needed per answer (e.g. time taken, specific text answer), expand here.
  ],
  score: {
    type: Number,
    default: 0
  },
  isSubmitted: { // Renaming 'completed' to 'isSubmitted' for clarity
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  timeTaken: { // Time in seconds or minutes
    type: Number
  }
});

module.exports = mongoose.model('MockTestSession', MockTestSessionSchema);
