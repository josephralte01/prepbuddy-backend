// === backend/utils/challengeSocketEvents.js ===
// To be located at src/challenges/challengeSocketEvents.util.js
module.exports = function (io) {
  return {
    emitChallengeInvite: (userId, payload) => {
      // Ensure userId is a string if it's an ObjectId
      io.to(String(userId)).emit('challenge:invited', payload);
    },

    emitChallengeUpdate: (userId, payload = {}) => { // Added payload for more context
      // Ensure userId is a string
      io.to(String(userId)).emit('challenge:updated', payload);
    },

    // Example: Emit progress update to participants of a specific challenge (invite)
    emitChallengeProgress: (challengeInviteId, progressUpdate) => {
        // Assuming challengeInviteId could be a room name, or fetch participants and emit to them
        io.to(`challenge_invite_${challengeInviteId}`).emit('challenge:progress', progressUpdate);
    }
  };
};
