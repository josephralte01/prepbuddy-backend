const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
// Add other routes as needed...

const app = express();

// CORS for frontend integration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Correct MongoDB connection block
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// API routes
app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes); etc...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unexpected promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Rejection shutting down...\n', err);
  process.exit(1);
});
