// To be located at src/challenges/challengeTracker.util.js
const axios = require('axios'); // This will remain an external HTTP call for now
const UserChallengeProgress = require('./userChallengeProgress.model.js'); // Updated path
const Challenge = require('./challenge.model.js'); // Updated path
const User = require('../users/user.model.js'); // Path to User model

/**
 * Updates progress for a specific user on a specific challenge.
 * This is a more direct approach than the original HTTP call.
 * @param {string} userId
 * @param {string} challengeId
 * @param {string} fieldToIncrement - The field in challenge.criteria and progress object.
 * @param {number} incrementAmount - Amount to increment by.
 */
async function updateUserChallengeProgress(userId, challengeId, fieldToIncrement, incrementAmount = 1) {
  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.isActive) {
      // console.log(`Challenge ${challengeId} not found or inactive for progress update.`);
      return null;
    }

    // Check if the fieldToIncrement is actually part of this challenge's criteria
    if (!challenge.criteria || typeof challenge.criteria[fieldToIncrement] === 'undefined') {
        // console.log(`Field ${fieldToIncrement} not part of criteria for challenge ${challengeId}`);
        return null;
    }

    let progress = await UserChallengeProgress.findOne({ user: userId, challenge: challengeId });

    if (!progress) {
      progress = await UserChallengeProgress.create({
        user: userId,
        challenge: challengeId,
        progress: { [fieldToIncrement]: incrementAmount },
      });
    } else {
      const currentFieldValue = progress.progress[fieldToIncrement] || 0;
      progress.progress[fieldToIncrement] = currentFieldValue + incrementAmount;
      // Mark for proper saving if progress is a Mixed type
      if (progress.progress instanceof mongoose.Schema.Types.Mixed) {
        progress.markModified('progress');
      }
    }

    // Check for completion
    // This is a simplified check. Complex criteria might need more sophisticated evaluation.
    const criteriaTarget = challenge.criteria[fieldToIncrement]; // Assuming criteria stores target value
    if (typeof criteriaTarget === 'number' && progress.progress[fieldToIncrement] >= criteriaTarget) {
      if (!progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();

        // Award XP and/or Badges if defined on the challenge
        if (challenge.xpReward > 0) {
          const { awardXP } = require('../xp/xpUtils.js'); // Path to xpUtils
          await awardXP(userId, challenge.xpReward, 'challenge_completed', challengeId, { challengeTitle: challenge.title });
        }
        if (challenge.badgeReward) {
          const user = await User.findById(userId);
          if (user && !user.badges.includes(challenge.badgeReward)) {
            user.badges.push(challenge.badgeReward);
            await user.save();
            // Log badge earning if necessary
          }
        }
      }
    }
    await progress.save();
    return progress;

  } catch (error) {
    console.error(`Error updating challenge progress for user ${userId}, challenge ${challengeId}:`, error);
    // Do not rethrow, to prevent one failed update from stopping others if called in a loop.
  }
}


// Original trackChallengeProgress - kept for reference, but recommend using updateUserChallengeProgress
// The self-API call is problematic.
exports.trackChallengeProgressOld = async (userId, field, increment = 1) => {
  try {
    // This logic assumes that 'field' directly maps to a criteria key in Challenge model
    // e.g., if field is 'completeMockTests', challenge.criteria should have { completeMockTests: targetCount }
    const activeChallenges = await Challenge.find({
        isActive: true,
        [`criteria.${field}`]: { $exists: true } // Find challenges that track this 'field'
    });

    // console.log(`Found ${activeChallenges.length} active challenges tracking field '${field}'`);

    for (const challenge of activeChallenges) {
      // Instead of HTTP call, directly update progress or call a service
      // console.log(`Tracking progress for user ${userId} on challenge ${challenge.title} for field ${field}`);
      await updateUserChallengeProgress(userId, challenge._id.toString(), field, increment);
    }
  } catch (err) {
    console.error('Challenge tracking failed (trackChallengeProgressOld):', err);
  }
};

// For calls from mockTestSessionController which used the old signature:
// await trackChallengeProgress(req.user._id, 'completeMockTests');
// This implies iterating over relevant challenges.

async function updateProgressForAllRelevantChallenges(userId, criteriaField, increment = 1) {
    try {
        const activeChallenges = await Challenge.find({
            isActive: true,
            [`criteria.${criteriaField}`]: { $exists: true } // Find challenges that track this 'criteriaField'
        });

        // console.log(`Found ${activeChallenges.length} challenges for criteria ${criteriaField} for user ${userId}`);
        for (const challenge of activeChallenges) {
            await updateUserChallengeProgress(userId, challenge._id.toString(), criteriaField, increment);
        }
    } catch (error) {
        console.error(`Error in updateProgressForAllRelevantChallenges for field ${criteriaField}:`, error);
    }
}

// Make updateProgressForAllRelevantChallenges the primary export for trackChallengeProgress
// to match the old behavior expected by mockTestSessionController
exports.trackChallengeProgress = updateProgressForAllRelevantChallenges;
exports.updateUserChallengeProgress = updateUserChallengeProgress; // Also export the specific one
exports.updateProgressForAllRelevantChallenges = updateProgressForAllRelevantChallenges; // Explicit export too
