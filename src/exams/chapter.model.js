const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a chapter name'],
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Please provide a subject ID']
  },
  examCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamCategory',
    required: [true, 'Please provide an exam category ID']
  },
  order: {
    type: Number,
    default: 0
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

// Index for faster querying by subject and order
ChapterSchema.index({ subject: 1, order: 1 });
ChapterSchema.index({ examCategory: 1, subject: 1 });


module.exports = mongoose.model('Chapter', ChapterSchema);
