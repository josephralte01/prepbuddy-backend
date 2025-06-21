const User = require('./user.model.js'); // Corrected path
const Subscription = require('../subscriptions/subscription.model.js'); // Assumed future path
const UserProgress = require('./userProgress.model.js'); // Assumed future path within users domain
const ExamCategory = require('../exams/examCategory.model.js'); // Corrected path
const XPLog = require('../xp/xpLog.model.js'); // Corrected path
const { awardXP } = require('../xp/xpUtils.js'); // For manual XP control

exports.getAdminStats = async (req, res) => {
  try {
    // isAdmin middleware already protects this route, req.user.role check is redundant
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ subscriptionTier: 'premium' });
    const basicUsers = await User.countDocuments({ subscriptionTier: 'basic' });
    const freeUsers = await User.countDocuments({ subscriptionTier: 'free' }); // Or { subscriptionTier: { $in: ['free', null, undefined] } }

    // This aggregation for revenue is a placeholder and might need adjustment based on actual Subscription model
    const revenueData = await Subscription.aggregate([
      // {$match: { status: 'active' } }, // Example: only active subscriptions
      {
        $group: {
          _id: "$tier", // Assuming 'tier' field exists on Subscription model
          count: { $sum: 1 },
          // totalAmount: { $sum: "$amount" } // Assuming 'amount' field exists
        }
      }
    ]);

    // Example for topScorers using User.xp as UserProgress might be too specific or not yet structured
    const topScorersByXP = await User.find({}).sort({xp: -1}).limit(5).select('username name xp');

    const examCategoryCount = await ExamCategory.countDocuments();

    res.status(200).json({
      users: {
        total: totalUsers,
        premium: premiumUsers,
        basic: basicUsers,
        free: freeUsers
      },
      revenue: revenueData, // Raw aggregation data
      topScorers: topScorersByXP,
      examCategories: { count: examCategoryCount }
    });

  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({ message: 'Server error fetching admin stats.', error: error.message });
  }
};

exports.manualXPControl = async (req, res) => {
  try {
    // isAdmin middleware protects this
    const { userId, xpAmount, reason, action } = req.body; // xpAmount, not xp

    if (!userId || typeof xpAmount !== 'number' || !reason || !action) {
      return res.status(400).json({ message: 'userId, xpAmount (number), action, and reason are required.' });
    }

    // Using the awardXP utility handles User.xp update and XPLog creation
    const result = await awardXP(userId, xpAmount, action, null, {
        reason,
        adminAdjusterId: req.user._id,
        source: 'manual-admin-adjustment'
    });

    if (!result || !result.user) {
        // awardXP would have console.logged the error if user not found or xpAmount was invalid
        return res.status(404).json({ message: 'User not found or invalid XP operation.' });
    }

    res.status(200).json({ message: 'XP updated successfully.', newXP: result.user.xp });
  } catch (error) {
    console.error("Error in manualXPControl:", error);
    res.status(500).json({ message: 'Server error adjusting XP.', error: error.message });
  }
};

// Placeholder for other admin functions, e.g., managing users, content etc.
exports.getAllUsersAdmin = async (req, res) => {
    try {
        // Add pagination, filtering, sorting as needed
        const users = await User.find({}).select('-password').sort({createdAt: -1});
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users for admin:", error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

exports.updateUserRoleAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, subscriptionTier } = req.body;

        if (!userId || (!role && !subscriptionTier)) {
            return res.status(400).json({ message: "User ID and role or tier are required."});
        }

        const updateData = {};
        if (role && ['user', 'admin', 'mentor'].includes(role)) updateData.role = role;
        if (subscriptionTier && ['free', 'basic', 'premium'].includes(subscriptionTier)) updateData.subscriptionTier = subscriptionTier;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields to update provided."});
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: "User not found."});

        res.status(200).json({ message: "User details updated.", user});

    } catch (error) {
        console.error("Error updating user role/tier by admin:", error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
