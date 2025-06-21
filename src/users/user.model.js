const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [ // Basic email validation
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Do not return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'mentor'], // Added mentor role possibility
    default: 'user'
  },
  subscriptionTier: { // Added from previous observation of checkTierAccess middleware
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  isVerified: { // For email verification
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  passwordResetToken: String, // Renamed from resetToken
  passwordResetTokenExpiry: Date, // Renamed from resetTokenExpiry

  // Profile related
  profilePicture: {
    type: String, // URL to image
    default: 'default_avatar.png' // A default avatar
  },
  bio: {
    type: String,
    maxlength: [250, 'Bio cannot exceed 250 characters'],
    trim: true,
  },

  // Gamification Fields
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActiveDate: { // Last date user performed a streak-countable action
    type: Date,
  },
  // rank: { type: Number }, // Rank can be calculated dynamically or updated periodically

  // Social Features
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Badges earned by the user
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }], // Refers to src/xp/badge.model.js

  // User preferences
  preferences: {
    receiveEmailNotifications: { type: Boolean, default: true },
    receiveStreakReminders: { type: Boolean, default: true },
    // Add other preferences as needed
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexing common query fields
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ xp: -1 }); // For leaderboards

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Middleware to update 'updatedAt' field
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});


// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
