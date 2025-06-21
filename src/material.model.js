const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { // Added title for better identification
    type: String,
    required: [true, "Material title is required."],
    trim: true
  },
  description: { // Added optional description
    type: String,
    trim: true
  },
  examCategory: { // Link to broader exam category
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamCategory', // Will be src/exams/examCategory.model.js
    // required: true // Making it optional if material can be general
  },
  subject: { // Link to subject
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject', // Will be src/exams/subject.model.js
    // required: true // Making it optional
  },
  chapter: { // Link to specific chapter - Renamed from chapterId for clarity
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter', // Will be src/exams/chapter.model.js
    // required: true // Making it optional, material might not always be chapter specific
  },
  topic: { // Link to specific topic
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic' // Will be src/exams/topic.model.js
  },
  materialType: {
    type: String,
    enum: ['notes', 'video_lecture', 'quiz_link', 'external_resource', 'article'],
    default: 'notes'
  },
  contentUrl: { // For video, quiz, external resource links
    type: String,
    trim: true,
    // validate: { validator: (v) => validator.isURL(v), message: 'Not a valid URL'} // If using validator pkg
  },
  bulletPoints: { // For notes type
    type: [String],
    // required: function() { return this.materialType === 'notes'; } // Example conditional requirement
  },
  estimatedStudyTimeMinutes: {
    type: Number,
    min: 1
  },
  createdBy: { // Who created/uploaded this material
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Will be src/users/user.model.js
  },
  isPublic: { // Whether accessible to all or specific groups/tiers
    type: Boolean,
    default: true
  },
  // createdAt will be added by timestamps:true
}, { timestamps: true });

materialSchema.index({ title: 1 });
materialSchema.index({ examCategory: 1, subject: 1, chapter: 1 });
materialSchema.index({ materialType: 1 });


module.exports = mongoose.model('Material', materialSchema);
