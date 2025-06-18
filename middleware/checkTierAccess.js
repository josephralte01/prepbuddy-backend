module.exports = function(requiredTier) {
  return (req, res, next) => {
    const tiers = ['free', 'basic', 'premium'];
    const userTier = req.user.subscriptionTier || 'free';

    if (tiers.indexOf(userTier) < tiers.indexOf(requiredTier)) {
      return res.status(403).json({
        error: `This feature requires a ${requiredTier} plan.`
      });
    }

    next();
  };
};
