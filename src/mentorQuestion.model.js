const mongoose = require('mongoose');

const mentorQuestionSchema = new mongoose.Schema({
  user: { // The user who asked the question
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Path will be ./users/user.model.js from src/
    required: true
  },
  subject: { // Optional: Subject of the question for categorization
    type: String,
    // ref: 'Subject' // Could also reference Subject model from exams domain
  },
  topic: { // Optional: Topic of the question
    type: String,
    // ref: 'Topic' // Could also reference Topic model from exams domain
  },
  question: {
    type: String,
    required: [true, "Question content cannot be empty."],
    trim: true,
    minlength: [10, "Question seems too short. Please provide more details."],
    maxlength: [2000, "Question is too long. Try to be more concise or break it down."]
  },
  status: {
    type: String,
    enum: ['pending_mentor_assignment', 'pending_mentor_reply', 'replied', 'closed_by_user', 'closed_by_admin'],
    default: 'pending_mentor_assignment'
  },
  reply: {
    type: String,
    trim: true,
    default: null
  },
  repliedBy: { // The mentor (User with 'mentor' or 'admin' role) who replied
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Path will be ./users/user.model.js from src/
  },
  repliedAt: { // When the reply was given
      type: Date
  }
  // createdAt, updatedAt added by timestamps:true
}, {
  timestamps: true
});

mentorQuestionSchema.index({ user: 1, status: 1, createdAt: -1 });
mentorQuestionSchema.index({ status: 1, repliedBy: 1, createdAt: -1 }); // For mentors to find questions

module.exports = mongoose.model('MentorQuestion', mentorQuestionSchema);
