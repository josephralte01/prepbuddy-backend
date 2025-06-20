const User = require('../models/User');

exports.followUser = async (req, res) => {
  const targetUsername = req.params.username;
  const followerId = req.user._id;

  try {
    const target = await User.findOne({ username: targetUsername });
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (target._id.equals(followerId))
      return res.status(400).json({ message: "You can't follow yourself" });

    if (target.followers.includes(followerId))
      return res.status(400).json({ message: 'Already following' });

    target.followers.push(followerId);
    await target.save();

    await User.findByIdAndUpdate(followerId, { $push: { following: target._id } });

    res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  const targetUsername = req.params.username;
  const followerId = req.user._id;

  try {
    const target = await User.findOne({ username: targetUsername });
    if (!target) return res.status(404).json({ message: 'User not found' });

    target.followers.pull(followerId);
    await target.save();

    await User.findByIdAndUpdate(followerId, { $pull: { following: target._id } });

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
