const XPLog = require('../models/XPLog');

exports.logXPAction = async ({
  userId,
  action,
  xpEarned,
  metadata = {},
}) => {
  try {
    const log = new XPLog({
      user: userId,
      action,
      xp: xpEarned,
      metadata,
    });
    await log.save();
  } catch (error) {
    console.error('XP Logging failed:', error);
  }
};
