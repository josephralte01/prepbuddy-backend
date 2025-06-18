const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a subject name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  examCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamCategory',
    required: [true, 'Please provide an exam category']
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', SubjectSchema);