// Paths relative to src/exams/
const UserProgress = require('./userProgress.model.js');
const MockTest = require('./mockTest.model.js');
const Topic = require('./topic.model.js');
const ExamCategory = require('./examCategory.model.js');
const User = require('../users/user.model.js'); // Path to User model
const Material = require('../material.model.js'); // Path to Material model

// Get or create user progress for a specific exam category
exports.getUserProgressForExamCategory = async (req, res) => {
  try {
    const { examCategoryId } = req.params; // Assuming examCategoryId is a route parameter
    const userId = req.user._id; // Corrected from req.user.userId

    let userProgress = await UserProgress.findOne({
      user: userId,
      examCategory: examCategoryId
    })
      .populate('examCategory', 'name description')
      .populate('completedTopics.topic', 'name description')
      .populate('completedMaterials.material', 'title description materialType')
      .populate({
        path: 'mockTestResults.mockTest', // Populate the mockTest details within quizResults
        select: 'title totalQuestions'
      })
      .populate({
        path: 'mockTestResults.mockTestSession', // Populate session if needed
        select: 'submittedAt timeTakenSeconds'
      });

    if (!userProgress) {
      // Ensure exam category exists before creating progress for it
      const examCat = await ExamCategory.findById(examCategoryId);
      if (!examCat) {
          return res.status(404).json({ message: "Exam category not found." });
      }
      userProgress = await UserProgress.create({
        user: userId,
        examCategory: examCategoryId,
        // completedTopics: [], // Defaulted in schema or let it be empty
        // completedMaterials: [],
        // mockTestResults: []
      });
      // Re-fetch to populate, or populate manually after create
      userProgress = await UserProgress.findById(userProgress._id)
        .populate('examCategory', 'name description')
        .populate('completedTopics.topic', 'name description')
        .populate('completedMaterials.material', 'title description materialType')
        .populate({ path: 'mockTestResults.mockTest', select: 'title totalQuestions' });
    }

    res.status(200).json(userProgress); // Renamed from { userProgress } to just userProgress
  } catch (error) {
    console.error("Error in getUserProgressForExamCategory:", error);
    res.status(500).json({ message: 'Error fetching user progress.', error: error.message });
  }
};

// Mark a topic as completed for a user within an exam category
exports.markTopicAsCompleted = async (req, res) => {
  try {
    const { examCategoryId, topicId } = req.params; // Assuming these are route params
    const userId = req.user._id;

    const topic = await Topic.findById(topicId);
    if (!topic || topic.examCategory.toString() !== examCategoryId) { // Ensure topic belongs to exam category
      return res.status(404).json({ message: 'Topic not found or does not belong to this exam category.' });
    }

    const userProgress = await UserProgress.findOneAndUpdate(
      { user: userId, examCategory: examCategoryId },
      { $addToSet: { completedTopics: { topic: topicId, completedAt: new Date() } } }, // Use $addToSet to avoid duplicates
      { upsert: true, new: true } // Create if not exists, return updated
    ).populate('completedTopics.topic', 'name');

    // TODO: Award XP for topic completion?
    // const { awardXP } = require('../xp/xpUtils.js');
    // await awardXP(userId, 5, 'topic_completed', topicId, { topicTitle: topic.name, examCategoryId });

    res.status(200).json(userProgress);
  } catch (error) {
    console.error("Error in markTopicAsCompleted:", error);
    res.status(500).json({ message: 'Error marking topic as completed.', error: error.message });
  }
};

// Mark a material as completed (this might be better in material.controller.js or called by it)
// This is a more specific version for UserProgress model.
exports.markMaterialAsCompletedInUserProgress = async (req, res) => {
    try {
        const { examCategoryId, materialId } = req.params; // Assuming examCategoryId context
        const userId = req.user._id;

        const material = await Material.findById(materialId);
        if (!material || (material.examCategory && material.examCategory.toString() !== examCategoryId)) {
            return res.status(404).json({ message: "Material not found or doesn't belong to this exam category." });
        }

        const userProgress = await UserProgress.findOneAndUpdate(
            { user: userId, examCategory: examCategoryId },
            { $addToSet: { completedMaterials: { material: materialId, completedAt: new Date() } } },
            { upsert: true, new: true }
        ).populate('completedMaterials.material', 'title');

        // XP for material completion is handled in material.controller.js usually.
        // If this endpoint is called directly, XP logic might be needed here.

        res.status(200).json(userProgress);
    } catch (error) {
        console.error("Error in markMaterialAsCompletedInUserProgress:", error);
        res.status(500).json({ message: "Error marking material as completed in progress.", error: error.message });
    }
};


// Submit/log a mock test result for a user within an exam category
// This is different from mockTestSessionController.submit, which handles an active session.
// This might be for manually logging an external test or if sessions aren't used.
// For consistency, mock test session submission should primarily update UserProgress.
exports.logMockTestResult = async (req, res) => {
  try {
    const { examCategoryId, mockTestId } = req.params; // Assuming these are route params
    const { score, totalQuestionsAttempted, totalCorrectAnswers, timeTakenSeconds, mockTestSessionId } = req.body;
    const userId = req.user._id;

    const mockTest = await MockTest.findById(mockTestId);
    if (!mockTest || mockTest.examCategory.toString() !== examCategoryId) {
      return res.status(404).json({ message: 'Mock test not found or does not belong to this exam category.' });
    }

    const newResult = {
      mockTest: mockTestId,
      score,
      totalQuestionsAttempted,
      totalCorrectAnswers,
      timeTakenSeconds,
      completedAt: new Date()
    };
    if (mockTestSessionId) newResult.mockTestSession = mockTestSessionId;

    const userProgress = await UserProgress.findOneAndUpdate(
      { user: userId, examCategory: examCategoryId },
      { $push: { mockTestResults: newResult } },
      { upsert: true, new: true }
    ).populate({ path: 'mockTestResults.mockTest', select: 'title' });

    // XP for mock test completion is typically handled by mockTestSession.controller.js submit.
    // If this is a separate logging, XP might be awarded here.
    // const { awardXP } = require('../xp/xpUtils.js');
    // await awardXP(userId, 30, 'mock_test_logged', mockTestId, { score, examCategoryId });

    res.status(200).json(userProgress);
  } catch (error) {
    console.error("Error in logMockTestResult:", error);
    res.status(500).json({ message: 'Error logging mock test result.', error: error.message });
  }
};

// Generic CRUD functions from original routes file - these are usually admin-level or not typical for 'progress'
// For now, commenting out as the above action-specific endpoints are preferred for user progress.
// If general UserProgress doc manipulation is needed, these can be enabled with proper admin checks.

// exports.createUserProgress = async (req, res) => { /* ... admin only ... */ }
// exports.getAllUserProgress = async (req, res) => { /* ... admin only, or for user's own progress records across all categories ... */ }
// exports.getUserProgressById = async (req, res) => { /* ... admin or self (if ID is UserProgress _id) ... */ }
// exports.updateUserProgress = async (req, res) => { /* ... admin only ... */ }
// exports.deleteUserProgress = async (req, res) => { /* ... admin only ... */ }
