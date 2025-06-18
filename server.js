require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const examCategoryRoutes = require('./routes/examCategoryRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const topicRoutes = require('./routes/topicRoutes');
const questionRoutes = require('./routes/questionRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const userProgressRoutes = require('./routes/userProgressRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const errorHandler = require('./middleware/errorHandler');
const searchRoutes = require('./routes/searchRoutes');
// Middleware
app.use(cors());
app.use(express.json());
// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.get('/', (req, res) => {
  res.send('PrepBuddy API is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exam-categories', examCategoryRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/progress', userProgressRoutes);
// Error handling middleware
app.use(errorHandler);
app.use('/api/search', searchRoutes);
// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});