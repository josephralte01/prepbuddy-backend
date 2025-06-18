const MentorQuestion = require('../models/MentorQuestion');
const User = require('../models/User');

exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required." });

    const newQ = await MentorQuestion.create({
      user: req.user.userId,
      question
    });

    res.status(201).json({ message: "Question submitted.", data: newQ });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyQuestions = async (req, res) => {
  try {
    const questions = await MentorQuestion.find({ user: req.user.userId });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.replyToQuestion = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Only mentors/admins can reply." });
    }

    const { reply } = req.body;
    const { id } = req.params;

    const q = await MentorQuestion.findByIdAndUpdate(
      id,
      {
        reply,
        repliedBy: req.user.userId
      },
      { new: true }
    );

    res.status(200).json({ message: "Reply added.", data: q });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
