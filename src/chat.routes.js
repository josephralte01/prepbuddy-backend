const express = require('express');
const router = express.Router();
// Paths relative to src/
const authMiddleware = require('./shared/middleware/authMiddleware.js');
const {
    sendMessage,
    getChatHistory,
    markMessagesAsRead, // New controller function
    getConversations    // New controller function
} = require('./chat.controller.js');

// All chat routes require authentication
router.use(authMiddleware);

// Send a new message
router.post('/send', sendMessage);

// Get chat history with another user
router.get('/history/:otherUserId', getChatHistory); // Parameter changed for clarity

// Get list of recent conversations for the logged-in user
router.get('/conversations', getConversations);

// Mark messages in a conversation as read
router.post('/messages/mark-read', markMessagesAsRead);


module.exports = router;
