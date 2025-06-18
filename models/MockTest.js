const mongoose = require('mongoose');

const MockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a test title'],
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
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  duration: {
    type: Number, // in minutes
    required: [true, 'Please provide test duration']
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Please provide total number of questions']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MockTest', MockTestSchema);