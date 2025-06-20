const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const mockTestSessionRoutes = require('./routes/mockTestSessionRoutes');
const xpLogRoutes = require('./routes/xpLogRoutes');
const userRoutes = require('./routes/userRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const chatRoutes = require('./routes/chatRoutes'); // ✅

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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/material', materialRoutes);
app.use('/api/mock-test', mockTestSessionRoutes);
app.use('/api/xp-logs', xpLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/chat', chatRoutes); // ✅ Chat route
app.use('/api/habits', require('./routes/habitRoutes'));
app.use("/api/badges", require("./routes/badgeRoutes"));
app.use("/api/doubts", require("./routes/doubtRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/notificationAnalyticsRoutes'));
app.use('/api/xp-badges', require('./routes/xpBadgeRoutes'));

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
