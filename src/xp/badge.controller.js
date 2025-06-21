const Badge = require('./badge.model.js');
const User = require('../../users/user.model.js'); // Future path

// Admin: Create a new badge
exports.createBadge = async (req, res) => {
  try {
    // req.body should contain name, icon, type, and type-specific fields like xpThreshold or criteria
    const badge = await Badge.create(req.body);
    res.status(201).json(badge);
  } catch (error) {
    if (error.code === 11000) { // MongoError: Duplicate key
        return res.status(400).json({ message: 'A badge with this name already exists.' });
    }
    console.error('Error creating badge:', error);
    res.status(500).json({ message: 'Error creating badge', error: error.message });
  }
};

// Admin & Public: Get all badges (or filter by type, etc.)
exports.getBadges = async (req, res) => { // Renamed from getAllXPBadges for consistency
  try {
    const filter = {};
    if(req.query.type) filter.type = req.query.type;
    // Could add more filters: isPublic, etc.

    const badges = await Badge.find(filter).sort({ type: 1, xpThreshold: 1, name: 1 });
    res.status(200).json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ message: 'Error fetching badges', error: error.message });
  }
};

// Admin: Get a single badge by ID
exports.getBadgeById = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found.' });
    }
    res.status(200).json(badge);
  } catch (error) {
    console.error('Error fetching badge by ID:', error);
    res.status(500).json({ message: 'Error fetching badge', error: error.message });
  }
};

// Admin: Update a badge
exports.updateBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found.' });
    }
    res.status(200).json(badge);
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'A badge with this name already exists.' });
    }
    console.error('Error updating badge:', error);
    res.status(500).json({ message: 'Error updating badge', error: error.message });
  }
};

// Admin: Delete a badge
exports.deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found.' });
    }
    // Optionally: Remove this badge from all users who have earned it
    // await User.updateMany({}, { $pull: { badges: req.params.id } });
    res.status(200).json({ message: 'Badge deleted successfully.' });
  } catch (error) {
    console.error('Error deleting badge:', error);
    res.status(500).json({ message: 'Error deleting badge', error: error.message });
  }
};

// User: Get available badges and claimed status for the logged-in user
exports.getAvailableUserBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('xp badges').lean(); // .lean() for plain JS object
    if (!user) return res.status(404).json({ message: "User not found."}); // Should not happen if auth middleware is working

    const allBadges = await Badge.find({ isPublic: true }).sort({ type: 1, xpThreshold: 1, name: 1 }).lean();

    const response = allBadges.map(badge => {
      const isClaimed = user.badges && user.badges.some(userBadgeId => userBadgeId.equals(badge._id));
      let canClaim = false;
      if (!isClaimed && badge.type === 'xp_threshold' && user.xp >= badge.xpThreshold) {
        canClaim = true;
      }
      // Add logic for other badge types if they are manually claimable
      // For example, if a 'milestone' badge type is claimable once criteria met (not auto-awarded)

      return {
        ...badge,
        isClaimed: isClaimed,
        canClaim: canClaim
      };
    });

    res.status(200).json(response);
  } catch (err) {
    console.error("Error getting user badges:", err);
    res.status(500).json({ message: "Server error getting user badges" });
  }
};

// User: Claim a badge (primarily for 'xp_threshold' type for now)
exports.claimUserBadge = async (req, res) => {
  try {
    const { badgeId } = req.body;
    const user = await User.findById(req.user._id); // Need full user object to save

    if (!user) return res.status(404).json({ message: "User not found."});


    const badge = await Badge.findById(badgeId);
    if (!badge) return res.status(404).json({ message: "Badge not found." });

    if (user.badges.includes(badgeId)) {
      return res.status(400).json({ message: "Badge already claimed." });
    }

    // Check claim eligibility based on badge type
    if (badge.type === 'xp_threshold') {
      if (user.xp < badge.xpThreshold) {
        return res.status(403).json({ message: "Not enough XP to claim this badge." });
      }
    } else {
      // For other badge types, direct claiming might not be allowed, or different logic applies
      // For now, only 'xp_threshold' badges are manually claimable through this endpoint.
      // Other types might be awarded automatically by other system events.
      return res.status(400).json({ message: `This type of badge ('${badge.type}') cannot be claimed directly or requires different criteria.` });
    }

    user.badges.push(badgeId);
    await user.save();

    // Optionally, log XP or an event for claiming a badge if that makes sense
    // await XPLog.create({ user: user._id, action: 'badge_claimed', xpEarned: 0, metadata: { badgeId } });

    res.status(200).json({ success: true, badgeId, message: "Badge claimed successfully!" });
  } catch (err) {
    console.error("Error claiming badge:", err);
    res.status(500).json({ message: "Server error claiming badge" });
  }
};
