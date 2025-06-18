const UserProgress = require('../models/UserProgress');
const MockTest = require('../models/MockTest');
const Topic = require('../models/Topic');

// Get or create user progress
const getUserProgress = async (req, res) => {
  try {
    const { examCategoryId } = req.params;
    const userId = req.user.userId;
    
    let userProgress = await UserProgress.findOne({
      user: userId,
      examCategory: examCategoryId
    })
      .populate('examCategory', 'name')
      .populate('completedTopics', 'name')
      .populate({
        path: 'quizResults',
        populate: {
          path: 'quiz',
          select: 'title totalQuestions'
        }
      });
    
    // If no progress record exists, create one
    if (!userProgress) {
      userProgress = await UserProgress.create({
        user: userId,
        examCategory: examCategoryId,
        completedTopics: [],
        quizResults: []
      });
      
      // Populate the newly created record
      userProgress = await UserProgress.findById(userProgress._id)
        .populate('examCategory', 'name')
        .populate('completedTopics', 'name')
        .populate({
          path: 'quizResults',
          populate: {
            path: 'quiz',
            select: 'title totalQuestions'
          }
        });
    }
    
    res.status(200).json({ userProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark topic as completed
const markTopicCompleted = async (req, res) => {
  try {
    const { examCategoryId, topicId } = req.params;
    const userId = req.user.userId;
    
    // Check if topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Find or create progress record
    let userProgress = await UserProgress.findOne({
      user: userId,
      examCategory: examCategoryId
    });
    
    if (!userProgress) {
      userProgress = await UserProgress.create({
        user: userId,
        examCategory: examCategoryId,
        completedTopics: [topicId],
        quizResults: []
      });
    } else {
      // Check if topic is already marked as completed
      if (!userProgress.completedTopics.includes(topicId)) {
        userProgress.completedTopics.push(topicId);
        userProgress.lastActivity = Date.now();
        await userProgress.save();
      }
    }
    
    userProgress = await UserProgress.findById(userProgress._id)
      .populate('examCategory', 'name')
      .populate('completedTopics', 'name');
    
    res.status(200).json({ userProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit quiz result
const submitQuizResult = async (req, res) => {
  try {
    const { examCategoryId, quizId } = req.params;
    const { score, totalQuestions, timeTaken } = req.body;
    const userId = req.user.userId;
    
    // Check if quiz exists
    const quiz = await MockTest.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Find or create progress record
    let userProgress = await UserProgress.findOne({
      user: userId,
      examCategory: examCategoryId
    });
    
    if (!userProgress) {
      userProgress = await UserProgress.create({
        user: userId,
        examCategory: examCategoryId,
        completedTopics: [],
        quizResults: [{
          quiz: quizId,
          score,
          totalQuestions,
          timeTaken,
          completedAt: Date.now()
        }]
      });
    } else {
      // Add quiz result
      userProgress.quizResults.push({
        quiz: quizId,
        score,
        totalQuestions,
        timeTaken,
        completedAt: Date.now()
      });
      
      userProgress.lastActivity = Date.now();
      await userProgress.save();
    }
    
    userProgress = await UserProgress.findById(userProgress._id)
      .populate('examCategory', 'name')
      .populate({
        path: 'quizResults',
        populate: {
          path: 'quiz',
          select: 'title totalQuestions'
        }
      });
    
    res.status(200).json({ userProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserProgress,
  markTopicCompleted,
  submitQuizResult
};