const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const ExamCategory = require('../models/ExamCategory');
const Subject = require('../models/Subject');

// Create new mock test
const createMockTest = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      examCategoryId, 
      subjectIds, 
      duration, 
      totalQuestions,
      questionIds 
    } = req.body;
    
    // Check if exam category exists
    const examCategory = await ExamCategory.findById(examCategoryId);
    if (!examCategory) {
      return res.status(404).json({ error: 'Exam category not found' });
    }
    
    // Check if subjects exist if provided
    if (subjectIds && subjectIds.length > 0) {
      const subjectsCount = await Subject.countDocuments({
        _id: { $in: subjectIds },
        examCategory: examCategoryId
      });
      
      if (subjectsCount !== subjectIds.length) {
        return res.status(400).json({ error: 'One or more subjects are invalid or do not belong to the selected exam category' });
      }
    }
    
    // Check if questions exist if provided
    let questions = [];
    if (questionIds && questionIds.length > 0) {
      questions = await Question.find({
        _id: { $in: questionIds },
        examCategory: examCategoryId,
        isActive: true
      });
      
      if (questions.length !== questionIds.length) {
        return res.status(400).json({ error: 'One or more questions are invalid or inactive' });
      }
    }
    
    // Create mock test
    const mockTest = await MockTest.create({
      title,
      description,
      examCategory: examCategoryId,
      subjects: subjectIds || [],
      duration,
      totalQuestions,
      questions: questionIds || [],
      createdBy: req.user.userId
    });
    
    res.status(201).json({ mockTest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all mock tests
const getAllMockTests = async (req, res) => {
  try {
    const { examCategoryId } = req.query;
    
    // Filter by exam category if provided
    const filter = examCategoryId ? { examCategory: examCategoryId, isActive: true } : { isActive: true };
    
    const mockTests = await MockTest.find(filter)
      .populate('examCategory', 'name')
      .populate('subjects', 'name')
      .populate('createdBy', 'name')
      .select('-questions'); // Exclude questions array for performance
    
    res.status(200).json({ mockTests, count: mockTests.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single mock test
const getMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mockTest = await MockTest.findById(id)
      .populate('examCategory', 'name')
      .populate('subjects', 'name')
      .populate('createdBy', 'name');
    
    if (!mockTest) {
      return res.status(404).json({ error: 'Mock test not found' });
    }
    
    res.status(200).json({ mockTest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mock test with questions
const getMockTestWithQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mockTest = await MockTest.findById(id)
      .populate('examCategory', 'name')
      .populate('subjects', 'name')
      .populate({
        path: 'questions',
        select: 'text options difficulty' // Exclude explanation and correct answers
      });
    
    if (!mockTest) {
      return res.status(404).json({ error: 'Mock test not found' });
    }
    
    res.status(200).json({ mockTest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update mock test
const updateMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      examCategoryId, 
      subjectIds, 
      duration, 
      totalQuestions,
      questionIds,
      isActive 
    } = req.body;
    
    let updateData = { title, description, duration, totalQuestions, isActive };
    
    // Check and update exam category if provided
    if (examCategoryId) {
      const examCategory = await ExamCategory.findById(examCategoryId);
      if (!examCategory) {
        return res.status(404).json({ error: 'Exam category not found' });
      }
      updateData.examCategory = examCategoryId;
    }
    
    // Check and update subjects if provided
    if (subjectIds && subjectIds.length > 0) {
      const subjectsCount = await Subject.countDocuments({
        _id: { $in: subjectIds }
      });
      
      if (subjectsCount !== subjectIds.length) {
        return res.status(400).json({ error: 'One or more subjects are invalid' });
      }
      
      updateData.subjects = subjectIds;
    }
    
    // Check and update questions if provided
    if (questionIds && questionIds.length > 0) {
      const questionsCount = await Question.countDocuments({
        _id: { $in: questionIds },
        isActive: true
      });
      
      if (questionsCount !== questionIds.length) {
        return res.status(400).json({ error: 'One or more questions are invalid or inactive' });
      }
      
      updateData.questions = questionIds;
    }
    
    const mockTest = await MockTest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('examCategory', 'name')
      .populate('subjects', 'name')
      .populate('createdBy', 'name')
      .select('-questions'); // Exclude questions array for performance
    
    if (!mockTest) {
      return res.status(404).json({ error: 'Mock test not found' });
    }
    
    res.status(200).json({ mockTest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete mock test
const deleteMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mockTest = await MockTest.findByIdAndDelete(id);
    
    if (!mockTest) {
      return res.status(404).json({ error: 'Mock test not found' });
    }
    
    res.status(200).json({ message: 'Mock test deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMockTest,
  getAllMockTests,
  getMockTest,
  getMockTestWithQuestions,
  updateMockTest,
  deleteMockTest
};