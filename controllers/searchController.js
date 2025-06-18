const Topic = require('../models/Topic');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const ExamCategory = require('../models/ExamCategory');
const MockTest = require('../models/MockTest');

const search = async (req, res) => {
  try {
    const { query, type, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchOptions = { $regex: query, $options: 'i' };
    let results = [];
    
    // Search in exam categories
    if (!type || type === 'examCategories') {
      const examCategories = await ExamCategory.find({
        $or: [
          { name: searchOptions },
          { description: searchOptions }
        ],
        isActive: true
      }).limit(parseInt(limit));
      
      results.push(...examCategories.map(item => ({
        ...item._doc,
        itemType: 'examCategory'
      })));
    }
    
    // Search in subjects
    if (!type || type === 'subjects') {
      const subjects = await Subject.find({
        $or: [
          { name: searchOptions },
          { description: searchOptions }
        ],
        isActive: true
      })
      .populate('examCategory', 'name')
      .limit(parseInt(limit));
      
      results.push(...subjects.map(item => ({
        ...item._doc,
        itemType: 'subject'
      })));
    }
    
    // Search in topics
    if (!type || type === 'topics') {
      const topics = await Topic.find({
        $or: [
          { name: searchOptions },
          { description: searchOptions },
          { content: searchOptions }
        ],
        isActive: true
      })
      .populate('subject', 'name')
      .limit(parseInt(limit));
      
      results.push(...topics.map(item => ({
        ...item._doc,
        itemType: 'topic'
      })));
    }
    
    // Search in questions
    if (!type || type === 'questions') {
      const questions = await Question.find({
        text: searchOptions,
        isActive: true
      })
      .populate('subject', 'name')
      .populate('examCategory', 'name')
      .limit(parseInt(limit));
      
      results.push(...questions.map(item => ({
        ...item._doc,
        itemType: 'question'
      })));
    }
    
    // Search in mock tests
    if (!type || type === 'mockTests') {
      const mockTests = await MockTest.find({
        $or: [
          { title: searchOptions },
          { description: searchOptions }
        ],
        isActive: true
      })
      .populate('examCategory', 'name')
      .limit(parseInt(limit));
      
      results.push(...mockTests.map(item => ({
        ...item._doc,
        itemType: 'mockTest'
      })));
    }
    
    res.status(200).json({ 
      results, 
      count: results.length,
      query
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  search
};