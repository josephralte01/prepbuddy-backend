const ExamCategory = require('../models/ExamCategory');
const slugify = require('slugify');

// Create new exam category
const createExamCategory = async (req, res) => {
  try {
    const { name = '', description = '' } = req.body;

    if (!name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const slug = slugify(name, { lower: true });

    const examCategory = await ExamCategory.create({
      name,
      description,
      slug
    });

    res.status(201).json({ examCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all exam categories
const getAllExamCategories = async (req, res) => {
  try {
    const categories = await ExamCategory.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ categories, count: categories.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single exam category
const getExamCategory = async (req, res) => {
  try {
    const category = await ExamCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Exam category not found' });
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update exam category
const updateExamCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }
    if (description !== undefined) updateData.description = description;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const category = await ExamCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ error: 'Exam category not found' });
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete exam category
const deleteExamCategory = async (req, res) => {
  try {
    const category = await ExamCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Exam category not found' });
    }

    res.status(200).json({ message: 'Exam category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExamCategory,
  getAllExamCategories,
  getExamCategory,
  updateExamCategory,
  deleteExamCategory
};
