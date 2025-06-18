const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const examCategoryRoutes = require('./routes/examCategoryRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const topicRoutes = require('./routes/topicRoutes');
const questionRoutes = require('./routes/questionRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const userProgressRoutes = require('./routes/userProgressRoutes');
const searchRoutes = require('./routes/searchRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ✅ NEW

const errorHandler = require('./middleware/errorHandler');
dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exam-categories', examCategoryRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/progress', userProgressRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/admin', adminRoutes); // ✅ NEW

// Error Handler
app.use(errorHandler);

// DB Connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('DB connection failed:', err);
});
