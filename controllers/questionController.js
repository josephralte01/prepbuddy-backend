const Question = require('../models/Question');
const ExamCategory = require('../models/ExamCategory');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

// Create new question
const createQuestion = async (req, res) => {
  try {
    const {
      text = '',
      options = [],
      explanation = '',
      difficulty = 'medium',
      topicId = null,
      subjectId,
      examCategoryId
    } = req.body;

    if (!text || !Array.isArray(options) || options.length === 0 || !subjectId || !examCategoryId) {
      return res.status(400).json({ error: 'Required fields are missing or invalid' });
    }

    const [examCategory, subject] = await Promise.all([
      ExamCategory.findById(examCategoryId),
      Subject.findById(subjectId)
    ]);

    if (!examCategory) return res.status(404).json({ error: 'Exam category not found' });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    let topic = null;
    if (topicId) {
      topic = await Topic.findById(topicId);
      if (!topic) return res.status(404).json({ error: 'Topic not found' });
    }

    const question = await Question.create({
      text,
      options,
      explanation,
      difficulty,
      topic: topicId,
      subject: subjectId,
      examCategory: examCategoryId,
      createdBy: req.user?.userId || null
    });

    res.status(201).json({ question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all questions
const getAllQuestions = async (req, res) => {
  try {
    const { examCategoryId, subjectId, topicId, difficulty } = req.query;
    const filter = { isActive: true };

    if (examCategoryId) filter.examCategory = examCategoryId;
    if (subjectId) filter.subject = subjectId;
    if (topicId) filter.topic = topicId;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .populate('examCategory', 'name slug')
      .populate('subject', 'name slug')
      .populate('topic', 'name slug')
      .populate('createdBy', 'name');

    res.status(200).json({ questions, count: questions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single question
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('examCategory', 'name slug')
      .populate('subject', 'name slug')
      .populate('topic', 'name slug')
      .populate('createdBy', 'name');

    if (!question) return res.status(404).json({ error: 'Question not found' });

    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      text,
      options,
      explanation,
      difficulty,
      topicId,
      subjectId,
      examCategoryId,
      isActive
    } = req.body;

    const updateData = {};
    if (text) updateData.text = text;
    if (options) updateData.options = options;
    if (explanation) updateData.explanation = explanation;
    if (difficulty) updateData.difficulty = difficulty;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    if (examCategoryId) {
      const examCategory = await ExamCategory.findById(examCategoryId);
      if (!examCategory) return res.status(404).json({ error: 'Exam category not found' });
      updateData.examCategory = examCategoryId;
    }

    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });
      updateData.subject = subjectId;
    }

    if (topicId) {
      const topic = await Topic.findById(topicId);
      if (!topic) return res.status(404).json({ error: 'Topic not found' });
      updateData.topic = topicId;
    }

    const question = await Question.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('examCategory', 'name slug')
      .populate('subject', 'name slug')
      .populate('topic', 'name slug')
      .populate('createdBy', 'name');

    if (!question) return res.status(404).json({ error: 'Question not found' });

    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion
};
