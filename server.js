const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
// dotenv.config(); // dotenv is now handled by env.js
const http = require('http');
const { Server } = require('socket.io');
const config = require('./src/shared/config/env.js'); // Import validated config

// Shared middleware
const { errorHandler } = require('./src/shared/middleware/errorHandler.js'); // Path to your error handler

// --- Routes ---
// User Domain (Auth, User Profile, Follow, Admin)
const authRoutes = require('./src/users/auth.routes.js');
const userRoutes = require('./src/users/user.routes.js');
const followRoutes = require('./src/users/follow.routes.js');
const adminRoutes = require('./src/users/admin.routes.js');

// AI Domain
const aiRoutes = require('./src/ai/ai.routes.js');

// Exams Domain (Exam Categories, Subjects, Topics, Questions, MockTests, MockTestSessions, UserProgress in Exams)
const examCategoryRoutes = require('./src/exams/examCategory.routes.js');
const subjectRoutes = require('./src/exams/subject.routes.js');
const topicRoutes = require('./src/exams/topic.routes.js');
const questionRoutes = require('./src/exams/question.routes.js');
const mockTestRoutes = require('./src/exams/mockTest.routes.js');
const mockTestSessionRoutes = require('./src/exams/mockTestSession.routes.js');
const userProgressExamRoutes = require('./src/exams/userProgress.routes.js');

// XP Domain (XP Logs, Badges, Streaks, Leaderboard)
const xpLogRoutes = require('./src/xp/xpLog.routes.js');
const badgeRoutes = require('./src/xp/badge.routes.js');
const streakRoutes = require('./src/xp/streak.routes.js');
const leaderboardRoutes = require('./src/xp/leaderboard.routes.js');

// Challenges Domain
const challengeRoutes = require('./src/challenges/challenge.routes.js');

// Habits Domain
const habitRoutes = require('./src/habits/habit.routes.js');

// Other Domains (placed in src/ due to mkdir issues)
const chatRoutes = require('./src/chat.routes.js');
const doubtRoutes = require('./src/doubt.routes.js');
const materialRoutes = require('./src/material.routes.js');
const mentorRoutes = require('./src/mentor.routes.js');
const notificationRoutes = require('./src/notification.routes.js');
const notificationAnalyticsRoutes = require('./src/notificationAnalytics.routes.js');
const searchRoutes = require('./src/search.routes.js');
const subscriptionRoutes = require('./src/subscription.routes.js');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Expose io to app
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(config.mongodb.uri) // Use validated URI from config
  .then(() => console.log(`✅ MongoDB connected to ${config.mongodb.uri.substring(0, config.mongodb.uri.lastIndexOf('@'))}...`)) // Avoid logging full URI with creds
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message); // Log only message for brevity
    process.exit(1);
  });

// Routes
// User Domain
app.use('/api/users/auth', authRoutes); // e.g. /api/users/auth/login
app.use('/api/users', userRoutes); // e.g. /api/users/me/profile, /api/users/public/:username
app.use('/api/users/follow', followRoutes); // e.g. /api/users/follow/:username/follow
app.use('/api/admin', adminRoutes); // e.g. /api/admin/stats

// AI Domain
app.use('/api/ai', aiRoutes); // e.g. /api/ai/syllabus

// Exams Domain
app.use('/api/exams/categories', examCategoryRoutes); // e.g. /api/exams/categories/:examId/structure
app.use('/api/exams/subjects', subjectRoutes);
app.use('/api/exams/topics', topicRoutes);
app.use('/api/exams/questions', questionRoutes);
app.use('/api/exams/mock-tests', mockTestRoutes); // General mock test info
app.use('/api/exams/mock-test-sessions', mockTestSessionRoutes); // User sessions for tests
app.use('/api/exams/progress', userProgressExamRoutes); // User progress within an exam category

// XP Domain
app.use('/api/xp/logs', xpLogRoutes);
app.use('/api/xp/badges', badgeRoutes); // Merged badges
app.use('/api/xp/streaks', streakRoutes);
app.use('/api/xp/leaderboard', leaderboardRoutes);

// Challenges Domain
app.use('/api/challenges', challengeRoutes); // Covers templates and invites

// Habits Domain
app.use('/api/habits', habitRoutes); // Covers daily tasks and predefined habits

// Other Domains
app.use('/api/chat', chatRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/materials', materialRoutes); // Changed from /api/material
app.use('/api/mentor', mentorRoutes);
app.use('/api/notifications', notificationRoutes); // User-facing notifications
app.use('/api/analytics/notifications', notificationAnalyticsRoutes); // Admin notification analytics
app.use('/api/search', searchRoutes);
app.use('/api/subscriptions', subscriptionRoutes);


// --- Centralized Error Handling and 404 Not Found ---
// 404 Not Found Handler - Must be after all other routes
app.use((req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.method} ${req.originalUrl}` });
});

// Global Error Handler - Must be the last piece of middleware
app.use(errorHandler);


// Socket.IO setup
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId); // Join room named after user ID
    console.log(`🟢 User ${userId} connected`);
  }

  socket.on('disconnect', () => {
    console.log(`🔴 User ${userId} disconnected`);
  });
});

// Server listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
