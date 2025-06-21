const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Path will be ./users/user.model.js from src/
    required: true
  },
  // Storing subject & topic as strings for now as per original.
  // Consider converting to ObjectId refs to Subject/Topic models from 'exams' domain
  // if doubts need to be formally categorized against the exam structure.
  subject: {
    type: String,
    required: [true, "Subject is required."],
    trim: true
  },
  topic: {
    type: String,
    required: [true, "Topic is required."],
    trim: true
  },
  question: {
    type: String,
    required: [true, "Doubt question cannot be empty."],
    trim: true,
    maxlength: [2000, "Question is too long."]
  },
  aiAnswer: {
    type: String,
    trim: true
  },
  status: { // To track if the doubt is resolved, pending, etc.
    type: String,
    enum: ['pending_ai_response', 'answered_by_ai', 'escalated_to_mentor', 'resolved_by_mentor', 'closed'],
    default: 'pending_ai_response'
  },
  mentorAssigned: { // If escalated
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming mentors are Users with 'mentor' role
  },
  mentorAnswer: {
    type: String,
    trim: true
  },
  userRating: { // User can rate the answer
    type: Number,
    min: 1,
    max: 5
  },
  // createdAt will be added by timestamps: true
}, { timestamps: true });

doubtSchema.index({ user: 1, createdAt: -1 });
doubtSchema.index({ status: 1, subject: 1, topic: 1 });

module.exports = mongoose.model("Doubt", doubtSchema);
