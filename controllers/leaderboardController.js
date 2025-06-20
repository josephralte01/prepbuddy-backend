const User = require("../models/User");

const getLeaderboard = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "all";
    let users;

    if (timeframe === "week") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      users = await User.find({ lastActiveDate: { $gte: sevenDaysAgo } })
        .select("name username xp badges followers following")
        .lean();
    } else if (timeframe === "month") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      users = await User.find({ lastActiveDate: { $gte: thirtyDaysAgo } })
        .select("name username xp badges followers following")
        .lean();
    } else {
      users = await User.find()
        .select("name username xp badges followers following")
        .lean();
    }

    users.sort((a, b) => b.xp - a.xp);
    users = users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    const currentUser = await User.findById(req.user._id).select("following").lean();

    res.json(users.map(user => ({
      _id: user._id,
      name: user.name,
      username: user.username,
      xp: user.xp,
      badges: user.badges,
      rank: user.rank,
      isFollowing: currentUser.following.includes(user._id),
      followsYou: user.followers.includes(req.user._id),
    })));
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Error loading leaderboard" });
  }
};

module.exports = { getLeaderboard };
