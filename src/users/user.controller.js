const User = require('./user.model.js'); // Updated path
const { calculateUserStreak } = require('../xp/streak.util.js'); // For streak calculation logic

// Get public profile of a user
exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    // Select fields appropriate for a public profile
    const user = await User.findOne({ username }).select('username name xp streak profilePicture bio badges createdAt');
                                                                    // Added profilePicture, bio, badges. Removed rank, email.
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching public profile:', err);
    res.status(500).json({ message: 'Server error while fetching public profile.' });
  }
};

// Update current user's username
exports.updateUsername = async (req, res) => {
  const { username } = req.body;
  // Basic validation - more robust validation should be via Joi schema if this were more complex
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
  }
  // Add regex validation for username format if desired (e.g., in user.model.js or a Joi schema)

  try {
    // Check if new username is already taken by another user
    const existingUserWithNewUsername = await User.findOne({ username: username.trim() });
    if (existingUserWithNewUsername && existingUserWithNewUsername._id.toString() !== req.user._id.toString()) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        // Should not happen if authMiddleware is working
        return res.status(404).json({ message: 'User not found.'});
    }

    user.username = username.trim();
    await user.save();

    res.status(200).json({ message: 'Username updated successfully.', username: user.username });
  } catch (err) {
    console.error('Username update error:', err);
    // Handle potential duplicate key error from DB if unique index is violated (though above check should prevent it)
    if (err.code === 11000) {
        return res.status(409).json({ message: 'Username already taken.' });
    }
    res.status(500).json({ message: 'Server error while updating username.' });
  }
};

// Get streak status for the current user (extracted from userRoutes.js)
exports.getStreakReminderStatus = async (req, res) => {
  try {
    const user = req.user; // User object from authMiddleware

    // Use the centralized streak calculation logic
    const { streak } = calculateUserStreak(user.lastActiveDate, user.streak);

    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastActiveNormalized = user.lastActiveDate
        ? new Date(user.lastActiveDate.getFullYear(), user.lastActiveDate.getMonth(), user.lastActiveDate.getDate())
        : null;

    // Needs reminder if not active today
    const needsReminder = !lastActiveNormalized || lastActiveNormalized.getTime() < todayNormalized.getTime();

    res.status(200).json({
        currentStreak: streak, // Calculated current streak
        lastActiveDate: user.lastActiveDate,
        needsReminder: needsReminder && streak > 0 // Only remind if they have an active streak to lose
    });
  } catch (err) {
    console.error('Error checking streak status:', err);
    res.status(500).json({ message: 'Error checking streak status.' });
  }
};

// Placeholder for updating user profile (bio, profile picture etc.)
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = req.body; // e.g., { bio, profilePictureUrl, preferences: { ... } }

        // Remove fields that should not be updated directly this way
        delete updateData.email;
        delete updateData.username; // Username updated separately
        delete updateData.password;
        delete updateData.role;
        delete updateData.xp;
        delete updateData.streak;
        delete updateData.badges;

        const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true })
            .select('-password'); // Exclude password from result

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'Profile updated successfully.', user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Error updating profile.', error: error.message });
    }
};
