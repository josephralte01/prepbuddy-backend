const mongoose = require('mongoose');

// This model tracks a user's progress within a specific exam category,
// including completed topics, materials, and mock test results.
const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Will be ../users/user.model.js
    required: true
  },
  examCategory: { // The specific exam category this progress pertains to
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamCategory', // Path: ./examCategory.model.js (within src/exams/)
    required: true
  },
  // Tracks completed learning materials (e.g., notes, videos)
  completedMaterials: [{ // New field
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material' // Path: ../material.model.js (from src/)
    },
    completedAt: { type: Date, default: Date.now }
  }],
  // Tracks completed topics (can be inferred from completed materials or marked explicitly)
  completedTopics: [{
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic' // Path: ./topic.model.js (within src/exams/)
    },
    completedAt: { type: Date, default: Date.now }
  }],
  // Stores results from mock tests taken by the user for this exam category
  mockTestResults: [{ // Renamed from quizResults for clarity
    mockTest: { // Renamed from quiz
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest' // Path: ./mockTest.model.js (within src/exams/)
    },
    mockTestSession: { // Link to the specific session for this attempt
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTestSession' // Path: ./mockTestSession.model.js (within src/exams/)
    },
    score: Number,
    totalQuestionsAttempted: Number, // More specific than totalQuestions
    totalCorrectAnswers: Number,   // More specific
    timeTakenSeconds: Number,      // Was timeTaken
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Overall progress percentage for this exam category (can be calculated)
  // overallCompletionPercent: { type: Number, default: 0, min: 0, max: 100 },

  lastActivityAt: { // Renamed from lastActivity for clarity
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); // Adds createdAt, updatedAt

userProgressSchema.index({ user: 1, examCategory: 1 }, { unique: true }); // One progress doc per user per exam category

// Update lastActivityAt before saving if relevant fields are modified
userProgressSchema.pre('save', function(next) {
  if (this.isModified('completedMaterials') || this.isModified('completedTopics') || this.isModified('mockTestResults')) {
    this.lastActivityAt = new Date();
  }
  next();
});

module.exports = mongoose.model('UserProgress', userProgressSchema);
