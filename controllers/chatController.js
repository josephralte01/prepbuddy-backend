// === backend/controllers/chatController.js ===
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  const { to, content } = req.body;
  const from = req.user._id;

  if (!to || !content) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const message = await ChatMessage.create({ from, to, content });

    // Emit to receiver via socket (optional - if you manage io globally)
    req.app.get('io')?.to(to.toString()).emit('chat:message', {
      from,
      content,
      timestamp: message.timestamp,
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getChatHistory = async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.userId;

  try {
    const messages = await ChatMessage.find({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId },
      ],
    })
      .sort({ timestamp: 1 })
      .lean();

    res.json({ messages });
  } catch (err) {
    console.error('Get Chat History Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
