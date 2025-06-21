const Subject = require('./subject.model.js'); // Updated path
const ExamCategory = require('./examCategory.model.js'); // Updated path
const slugify = require('slugify');

// Create new subject
const createSubject = async (req, res) => {
  try {
    const { name, description, examCategoryId } = req.body;
    if (!name || !examCategoryId) return res.status(400).json({ error: 'Name and exam category ID are required' });

    const examCategory = await ExamCategory.findById(examCategoryId);
    if (!examCategory) return res.status(404).json({ error: 'Exam category not found' });

    const slug = slugify(name, { lower: true });

    const subject = await Subject.create({
      name,
      description,
      examCategory: examCategoryId,
      slug
    });

    res.status(201).json({ subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const { examCategoryId } = req.query;
    const filter = examCategoryId ? { examCategory: examCategoryId, isActive: true } : { isActive: true };

    const subjects = await Subject.find(filter).populate('examCategory', 'name slug');
    res.status(200).json({ subjects, count: subjects.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single subject
const getSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id).populate('examCategory', 'name slug');
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.status(200).json({ subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, examCategoryId, isActive } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }
    if (description) updateData.description = description;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    if (examCategoryId) {
      const examCategory = await ExamCategory.findById(examCategoryId);
      if (!examCategory) return res.status(404).json({ error: 'Exam category not found' });
      updateData.examCategory = examCategoryId;
    }

    const subject = await Subject.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('examCategory', 'name slug');

    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.status(200).json({ subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubject,
  updateSubject,
  deleteSubject
};
