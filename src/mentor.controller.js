// Paths relative to src/
const MentorQuestion = require('./mentorQuestion.model.js');
// User model not explicitly needed here if req.user is fully populated by authMiddleware
// const User = require('./users/user.model.js');

exports.askQuestion = async (req, res) => {
  try {
    const { question, subject, topic } = req.body; // Added subject and topic
    if (!question) {
      return res.status(400).json({ message: "Question content is required." });
    }

    const newMentorQuestion = await MentorQuestion.create({
      user: req.user._id, // authMiddleware provides full user object
      question,
      subject, // Optional
      topic,   // Optional
      status: 'pending_mentor_assignment' // Initial status
    });

    // TODO: Notify assigned mentor or mentor pool if assignment logic exists

    res.status(201).json({
        message: "Question submitted successfully. A mentor will review it shortly.",
        data: newMentorQuestion
    });
  } catch (error) {
    console.error("Error asking mentor question:", error);
    res.status(500).json({ message: 'Server error submitting your question.', error: error.message });
  }
};

exports.getMyQuestions = async (req, res) => {
  try {
    const questions = await MentorQuestion.find({ user: req.user._id })
        .populate('repliedBy', 'name username profilePicture') // Populate mentor details
        .sort({ createdAt: -1 });
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error fetching user's mentor questions:", error);
    res.status(500).json({ message: 'Server error fetching your questions.', error: error.message });
  }
};

// For mentors/admins to reply to a question
exports.replyToQuestion = async (req, res) => {
  try {
    // Role check should ideally be handled by isAdmin/isMentor middleware on the route
    // if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
    //   return res.status(403).json({ message: "Only mentors or admins can reply." });
    // }

    const { reply } = req.body;
    const { id: questionId } = req.params; // questionId

    if (!reply || reply.trim() === "") {
        return res.status(400).json({ message: "Reply content cannot be empty." });
    }

    const updatedQuestion = await MentorQuestion.findOneAndUpdate(
      { _id: questionId /*, status: { $in: ['pending_mentor_assignment', 'pending_mentor_reply'] } */ }, // Can only reply to pending questions
      {
        reply,
        repliedBy: req.user._id,
        repliedAt: new Date(),
        status: 'replied'
      },
      { new: true }
    ).populate('user', 'name email').populate('repliedBy', 'name username'); // Populate for notification or response

    if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found or cannot be replied to at this moment." });
    }

    // TODO: Notify the user (updatedQuestion.user) that their question has been answered.
    // Example: await sendEmail({ to: updatedQuestion.user.email, ... })
    // Example: io.to(updatedQuestion.user._id.toString()).emit('mentor:question_replied', updatedQuestion);


    res.status(200).json({ message: "Reply added successfully.", data: updatedQuestion });
  } catch (error) {
    console.error("Error replying to mentor question:", error);
    res.status(500).json({ message: 'Server error adding reply.', error: error.message });
  }
};

// --- Additional potential Mentor/Admin functions ---

// For Admin/Mentor: Get all questions (e.g., filter by status)
exports.getAllMentorQuestions = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const questions = await MentorQuestion.find(filter)
            .populate('user', 'username name')
            .populate('repliedBy', 'username name')
            .sort({ status: 1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalQuestions = await MentorQuestion.countDocuments(filter);

        res.status(200).json({
            questions,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalQuestions / parseInt(limit)),
            totalQuestions
        });
    } catch (error) {
        console.error("Error fetching all mentor questions:", error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// For Admin/Mentor: Update question status (e.g., assign, close)
exports.updateMentorQuestionStatus = async (req, res) => {
    try {
        const { id: questionId } = req.params;
        const { status, mentorIdToAssign } = req.body;

        const updateData = { status };
        if (status === 'pending_mentor_reply' && mentorIdToAssign) {
            updateData.repliedBy = mentorIdToAssign; // Assigning mentor without them replying yet
        } else if (status === 'closed_by_admin' || status === 'closed_by_user') {
            // Add any closing remarks if needed
        }
        // More complex status transitions might need more logic

        const question = await MentorQuestion.findByIdAndUpdate(questionId, updateData, { new: true });
        if (!question) return res.status(404).json({ message: "Question not found."});

        res.status(200).json({ message: `Question status updated to ${status}.`, data: question });
    } catch (error) {
        console.error("Error updating mentor question status:", error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
