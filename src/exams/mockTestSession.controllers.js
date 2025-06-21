const MockTestSessionService = require('./mockTestSession.service.js');

// Helper to handle service call errors
const handleServiceError = (res, error) => {
    console.error('MockTestSession Service Error:', error.message || error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An unexpected server error occurred.';
    res.status(statusCode).json({ message });
};

exports.startMockTestSession = async (req, res) => {
  try {
    const { mockTestId } = req.body;
    const userId = req.user._id;
    const result = await MockTestSessionService.startSession(userId, mockTestId);

    const httpStatus = result.isNew ? 201 : 200; // 201 if new session created, 200 if existing one returned
    res.status(httpStatus).json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.submitMockTestSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user._id;
    const { answers, timeTaken } = req.body;

    const result = await MockTestSessionService.submitSession(userId, sessionId, answers, timeTaken);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
};
