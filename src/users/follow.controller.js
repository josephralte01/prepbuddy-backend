const User = require('./user.model.js'); // Updated path

exports.followUser = async (req, res) => {
  const targetUsername = req.params.username;
  const followerId = req.user._id; // From authMiddleware

  try {
    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      return res.status(404).json({ message: 'User to follow not found.' });
    }

    if (targetUser._id.equals(followerId)) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const followerUser = await User.findById(followerId); // Fetch follower to update their 'following' list

    // Check if already following
    // Using $addToSet to prevent duplicates is more robust than includes then push
    if (followerUser.following.includes(targetUser._id)) {
        return res.status(400).json({ message: 'You are already following this user.' });
    }

    // Add to target's followers and current user's following lists
    // Using $addToSet ensures atomicity and prevents duplicates if somehow this check is bypassed or run concurrently.
    await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: followerId } });
    await User.findByIdAndUpdate(followerId, { $addToSet: { following: targetUser._id } });

    // TODO: Consider adding a Notification for the targetUser

    res.status(200).json({ message: `Successfully followed ${targetUsername}.` });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ message: 'Server error while trying to follow user.' });
  }
};

exports.unfollowUser = async (req, res) => {
  const targetUsername = req.params.username;
  const followerId = req.user._id; // From authMiddleware

  try {
    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      return res.status(404).json({ message: 'User to unfollow not found.' });
    }

    // It doesn't make sense to "unfollow yourself" but no harm in this check
    if (targetUser._id.equals(followerId)) {
      return res.status(400).json({ message: "You cannot unfollow yourself." });
    }

    // Remove from target's followers and current user's following lists
    // Using $pull to remove the IDs from the arrays.
    await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: followerId } });
    await User.findByIdAndUpdate(followerId, { $pull: { following: targetUser._id } });

    res.status(200).json({ message: `Successfully unfollowed ${targetUsername}.` });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ message: 'Server error while trying to unfollow user.' });
  }
};

// Optional: Get followers of a user
exports.getFollowers = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate('followers', 'username name profilePicture');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json(user.followers);
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Optional: Get users a user is following
exports.getFollowing = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate('following', 'username name profilePicture');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json(user.following);
    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
