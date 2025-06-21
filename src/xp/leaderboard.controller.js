const User = require('../users/user.model.js'); // Corrected path relative to src/xp/

exports.getLeaderboard = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "all_time"; // 'all_time', 'weekly', 'monthly'
    const limit = parseInt(req.query.limit, 10) || 25; // How many users to return
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    let query = {};
    let sortOptions = { xp: -1 }; // Default sort: highest XP overall

    // Note: Filtering by timeframe based on `lastActiveDate` as in the original controller
    // is not ideal for an XP leaderboard, as XP is cumulative.
    // A true time-framed leaderboard would require summing XPLog entries for that period.
    // The `getTopXPEarners` in `xpLog.controller.js` does this correctly.
    // This controller will focus on current standing based on total `User.xp`.
    // If time-framed leaderboards based on current User.xp and their last activity are desired,
    // then the original logic can be adapted. For now, simplifying to overall XP.

    if (timeframe === "weekly_active") { // Example: Top XP users active in the last week
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.lastActiveDate = { $gte: sevenDaysAgo };
    } else if (timeframe === "monthly_active") { // Example: Top XP users active in the last month
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.lastActiveDate = { $gte: thirtyDaysAgo };
    }
    // For "all_time", no date filter is applied to `query`.

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('username name xp profilePicture badges streak') // Select relevant public fields
      .populate('badges', 'name icon') // Populate basic badge info
      .lean();

    // Add rank. Rank is based on the paginated result set.
    // For global rank, a more complex query or separate rank calculation mechanism is needed.
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
    }));

    // Get total count for pagination purposes
    const totalUsersForLeaderboard = await User.countDocuments(query);

    res.status(200).json({
      leaderboard: rankedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsersForLeaderboard / limit),
      totalEntries: totalUsersForLeaderboard
    });

  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Error loading leaderboard." });
  }
};

// Example: Get current user's rank (could be a separate endpoint or part of /me)
exports.getCurrentUserRank = async (req, res) => {
    try {
        const userId = req.user._id;
        const currentUserXP = req.user.xp;

        // Count users with more XP to determine rank
        const higherRankedUsersCount = await User.countDocuments({ xp: { $gt: currentUserXP } });
        const currentUserRank = higherRankedUsersCount + 1;

        res.status(200).json({
            userId,
            username: req.user.username,
            xp: currentUserXP,
            rank: currentUserRank
        });
    } catch (error) {
        console.error("Error fetching user rank:", error);
        res.status(500).json({ message: "Error fetching user rank." });
    }
};
