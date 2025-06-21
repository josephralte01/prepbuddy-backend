// Paths relative to src/exams/
const MockTestSession = require('./mockTestSession.model.js');
const MockTest = require('./mockTest.model.js');
const User = require('../users/user.model.js'); // Path to User model
const { awardXP } = require('../xp/xpUtils.js'); // Path to xpUtils
const { updateProgressForAllRelevantChallenges } = require('../challenges/challengeTracker.util.js'); // Path to challengeTracker

class MockTestSessionService {
    async startSession(userId, mockTestId) {
        if (!mockTestId) {
            throw { statusCode: 400, message: 'Mock Test ID is required.' };
        }

        const mockTest = await MockTest.findById(mockTestId).lean(); // Use lean if not modifying mockTest doc
        if (!mockTest || !mockTest.isActive) {
            throw { statusCode: 404, message: 'Mock Test not found or is not active.' };
        }

        const existingSession = await MockTestSession.findOne({
            user: userId,
            mockTest: mockTestId,
            isSubmitted: false,
        }).lean();

        if (existingSession) {
            // Returning existing session is one way to handle this
            return { message: 'Active session already exists for this test.', session: existingSession, isNew: false };
        }

        const sessionQuestions = mockTest.questions.map(qId => ({
            question: qId,
            // Default status/fields from model will apply here
        }));

        const newSession = await MockTestSession.create({
            user: userId,
            mockTest: mockTestId,
            questions: sessionQuestions,
        });

        // Populate necessary fields for the response
        const populatedSession = await MockTestSession.findById(newSession._id)
            .populate({ path: 'mockTest', select: 'title totalQuestions questions' }) // Populate questions for client to render
            .populate({ path: 'questions.question', select: 'text options difficulty' }) // Populate question details within session
            .lean();

        return { message: 'Mock Test session started successfully.', session: populatedSession, isNew: true };
    }

    async submitSession(userId, sessionId, answers, timeTaken) {
        const session = await MockTestSession.findById(sessionId).populate({
            path: 'mockTest',
            populate: { path: 'questions', model: 'Question', populate: { path: 'topic subject examCategory', select: 'name' } } // Populate questions fully for scoring
        });

        if (!session || session.user.toString() !== userId.toString()) {
            throw { statusCode: 404, message: 'Session not found or unauthorized.' };
        }
        if (session.isSubmitted) {
            throw { statusCode: 400, message: 'This test session has already been submitted.' };
        }

        let score = 0;
        const processedSessionQuestions = [];

        for (const testQuestionDoc of session.mockTest.questions) {
            const userAnswer = answers.find(a => a.questionId === testQuestionDoc._id.toString());
            let isCorrect = false;
            let selectedOptionIdx = null;
            let status = 'skipped';

            if (userAnswer && typeof userAnswer.selectedOptionIndex === 'number') {
                selectedOptionIdx = userAnswer.selectedOptionIndex;
                status = 'answered';
                // Ensure the option exists and isCorrect is true
                if (testQuestionDoc.options[selectedOptionIdx] && testQuestionDoc.options[selectedOptionIdx].isCorrect) {
                    score++;
                    isCorrect = true;
                }
            }

            processedSessionQuestions.push({
                question: testQuestionDoc._id,
                selectedOptionIndex: selectedOptionIdx,
                isCorrect: isCorrect,
                status: status
            });
        }

        session.questions = processedSessionQuestions;
        session.score = score;
        session.isSubmitted = true;
        session.submittedAt = new Date();
        if (typeof timeTaken === 'number') session.timeTaken = timeTaken;

        await session.save();

        // XP and Challenge Tracking
        const xpAwarded = 30; // Example: make this dynamic based on score/difficulty or from mockTest settings
        await awardXP(userId, xpAwarded, 'mock_test_completed', session.mockTest._id, {
            sessionId: session._id,
            score: session.score,
            mockTestTitle: session.mockTest.title
        });
        await updateProgressForAllRelevantChallenges(userId, 'complete_mock_tests', 1); // Increment count for challenges

        // Update UserProgress for this exam category
        const UserProgress = require('./userProgress.model.js'); // Local require to avoid circular deps at module load
        const examCategoryId = session.mockTest.examCategory._id; // Assuming examCategory is populated or available

        const newResultForProgress = {
            mockTest: session.mockTest._id,
            mockTestSession: session._id,
            score: session.score,
            totalQuestionsAttempted: answers.length, // Or count from session.questions where status is 'answered'
            totalCorrectAnswers: score,
            timeTakenSeconds: session.timeTaken,
            completedAt: session.submittedAt
        };

        await UserProgress.findOneAndUpdate(
            { user: userId, examCategory: examCategoryId },
            { $push: { mockTestResults: newResultForProgress }, $set: { lastActivityAt: new Date()} },
            { upsert: true, new: true }
        );


        return {
            message: `Test submitted successfully. +${xpAwarded} XP`,
            sessionId: session._id,
            score: session.score,
            results: session.questions // Return processed questions with correctness for review
        };
    }
}

module.exports = new MockTestSessionService();
