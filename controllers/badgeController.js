const Badge = require("../models/Badge");
const User = require("../models/User");

exports.getAvailableBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("badges");
    const allBadges = await Badge.find().sort({ xpRequired: 1 });

    const response = allBadges.map(badge => ({
      _id: badge._id,
      name: badge.name,
      icon: badge.icon,
      xpRequired: badge.xpRequired,
      claimed: user.badges.some(userBadge => userBadge._id.equals(badge._id)),
    }));

    res.json(response);
  } catch (err) {
    console.error("Error getting badges:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.claimBadge = async (req, res) => {
  try {
    const { badgeId } = req.body;
    const user = await User.findById(req.user._id);

    const badge = await Badge.findById(badgeId);
    if (!badge) return res.status(404).json({ message: "Badge not found" });

    if (user.badges.includes(badgeId)) {
      return res.status(400).json({ message: "Badge already claimed" });
    }

    if (user.xp < badge.xpRequired) {
      return res.status(400).json({ message: "Not enough XP to claim this badge" });
    }

    user.badges.push(badgeId);
    await user.save();

    res.json({ success: true, badgeId });
  } catch (err) {
    console.error("Error claiming badge:", err);
    res.status(500).json({ message: "Server error" });
  }
};
