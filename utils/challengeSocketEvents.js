// === backend/utils/challengeSocketEvents.js ===
module.exports = function (io) {
  return {
    emitChallengeInvite: (userId, payload) => {
      io.to(userId).emit('challenge:invited', payload);
    },

    emitChallengeUpdate: (userId) => {
      io.to(userId).emit('challenge:updated');
    },
  };
};
