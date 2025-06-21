const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  from: { // Sender
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Path will be ./users/user.model.js from src/
    required: true,
  },
  to: { // Receiver
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Path will be ./users/user.model.js from src/
    required: true,
  },
  conversationId: { // To group messages between two users, helps in querying and indexing
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: [true, "Message content cannot be empty."],
    trim: true,
    maxlength: [2000, "Message content cannot exceed 2000 characters."]
  },
  // timestamp field is automatically added by { timestamps: true }
  readAt: { // Timestamp when the message was read by the recipient
    type: Date,
  },
  // Removed 'read' boolean, 'readAt' is more informative
  // Removed 'timestamp', use 'createdAt' from {timestamps: true}
}, { timestamps: true }); // Adds createdAt and updatedAt

// Helper to generate a consistent conversation ID
chatMessageSchema.statics.getConversationId = function(userId1, userId2) {
  // Sort IDs to ensure the conversationId is the same regardless of who is 'from' or 'to'
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

// Pre-save hook to ensure conversationId is set
chatMessageSchema.pre('save', function(next) {
  if (!this.conversationId && this.from && this.to) {
    this.conversationId = mongoose.model('ChatMessage').getConversationId(this.from, this.to);
  }
  next();
});

chatMessageSchema.index({ from: 1, to: 1, createdAt: -1 }); // For fetching chat history

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
