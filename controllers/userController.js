const User = require('../models/User');

// ✅ Public Profile
exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('name xp streak rank email');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching public profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Username Update
exports.updateUsername = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  try {
    const existing = await User.findOne({ username });
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const user = await User.findById(req.user._id);
    user.username = username;
    await user.save();

    res.status(200).json({ message: 'Username updated successfully', username });
  } catch (err) {
    console.error('Username update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
