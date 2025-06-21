const Challenge = require('./challenge.model.js'); // Pre-defined challenges
const ChallengeInvite = require('./challengeInvite.model.js'); // User-initiated challenges/invites
const UserChallengeProgress = require('./userChallengeProgress.model.js');
const User = require('../users/user.model.js'); // Future path
const challengeSocketEventsUtil = require('./challengeSocketEvents.util.js'); // Updated path

// --- Controller functions for Challenge Templates (pre-defined challenges) ---

// Admin: Create a new Challenge Template
exports.createChallengeTemplate = async (req, res) => {
    try {
        const challengeTemplate = await Challenge.create(req.body);
        res.status(201).json(challengeTemplate);
    } catch (error) {
        console.error('Error creating challenge template:', error);
        res.status(500).json({ message: 'Failed to create challenge template', error: error.message });
    }
};

// Get all active, public Challenge Templates
exports.getChallengeTemplates = async (req, res) => {
    try {
        const templates = await Challenge.find({ isActive: true, isPublic: true })
            .sort({ type: 1, createdAt: -1 });
        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching challenge templates:', error);
        res.status(500).json({ message: 'Failed to fetch challenge templates', error: error.message });
    }
};

// --- Controller functions for Challenge Invites / User-Initiated Challenges ---

// User creates a new challenge invite (e.g., 1v1 or group)
exports.createChallengeInvite = async (req, res) => {
  try {
    const { type, participants: participantUserIds, challengeDefinition } = req.body; // participants: array of user IDs
    const createdBy = req.user._id;

    if (!participantUserIds || !Array.isArray(participantUserIds) || participantUserIds.length === 0) {
        return res.status(400).json({ message: 'Participants are required.' });
    }

    // Ensure creator is not in participants for 1v1 type logic if needed, or handle self-challenge
    if (type === '1v1_xp_race' && participantUserIds.length !== 1) {
        return res.status(400).json({ message: '1v1 challenge requires exactly one opponent.'});
    }
    if (participantUserIds.includes(createdBy.toString())) {
        return res.status(400).json({ message: 'You cannot invite yourself to this type of challenge.' });
    }

    const allUserIdsInChallenge = [createdBy, ...participantUserIds];
    const usersExist = await User.countDocuments({ _id: { $in: allUserIdsInChallenge }});
    if (usersExist !== allUserIdsInChallenge.length) {
        return res.status(404).json({ message: 'One or more specified users not found.' });
    }

    const participants = [
        { user: createdBy, status: 'accepted', joinedAt: new Date() }, // Creator auto-accepts
        ...participantUserIds.map(id => ({ user: id, status: 'pending' }))
    ];

    const invite = await ChallengeInvite.create({
      type: type || 'custom', // from req.body
      challengeDefinition: challengeDefinition, // from req.body { title, description, goal }
      createdBy,
      participants,
      invitedUsers: participantUserIds, // Store who was explicitly invited
      status: 'pending_responses',
      // expiresAt: calculateExpiry() // TODO: Add expiry for invites
    });

    // Emit invite to participants (excluding creator)
    const io = req.app.get('io');
    if (io) {
        const socketEvents = challengeSocketEventsUtil(io);
        participantUserIds.forEach(userId => {
            socketEvents.emitChallengeInvite(userId, {
                inviteId: invite._id,
                from: req.user.username, // or name
                title: challengeDefinition.title || 'A new challenge!',
                type: invite.type
            });
        });
    }
    res.status(201).json(invite);
  } catch (err) {
    console.error('Error creating challenge invite:', err);
    res.status(500).json({ message: 'Failed to create challenge invite', error: err.message });
  }
};

// User responds to a challenge invite
exports.respondToChallengeInvite = async (req, res) => {
  try {
    const { inviteId } = req.params; // inviteId from URL param
    const { response } = req.body; // response = 'accepted' or 'rejected'
    const userId = req.user._id;

    const invite = await ChallengeInvite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: 'Challenge invite not found.' });
    }

    if (invite.status !== 'pending_responses') {
        return res.status(400).json({ message: `Cannot respond, challenge is already ${invite.status}.` });
    }

    const participant = invite.participants.find(p => p.user.equals(userId));
    if (!participant) {
      return res.status(403).json({ message: 'You are not a participant in this challenge invite.' });
    }
    if (participant.status !== 'pending') {
        return res.status(400).json({ message: `You have already responded to this invite with status: ${participant.status}.`});
    }

    participant.status = response;
    if (response === 'accepted') {
      participant.joinedAt = new Date();
    }

    // Check if all participants have responded to activate or cancel the challenge
    const allResponded = invite.participants.every(p => p.status !== 'pending');
    if (allResponded) {
        const acceptedCount = invite.participants.filter(p => p.status === 'accepted').length;
        // For 1v1, need creator + 1 accepted. For group, maybe all or a minimum.
        if (invite.type === '1v1_xp_race' && acceptedCount >= 2) { // Creator + Opponent
            invite.status = 'active';
        } else if (invite.type !== '1v1_xp_race' && acceptedCount >= (invite.minParticipants || 2)) { // Generic group challenges
             invite.status = 'active';
        } else {
            // Not enough acceptances or too many rejections
            invite.status = 'cancelled';
        }
    }

    await invite.save();

    // Notify participants of the update
    const io = req.app.get('io');
    if (io) {
        const socketEvents = challengeSocketEventsUtil(io);
        invite.participants.forEach(p => {
            if (!p.user.equals(userId)) { // Don't notify the user who just responded
                 socketEvents.emitChallengeUpdate(p.user, {
                    inviteId: invite._id,
                    status: invite.status,
                    responder: req.user.username,
                    response: response
                });
            }
        });
    }

    res.status(200).json({ message: `Successfully responded with '${response}'.`, invite });
  } catch (err) {
    console.error('Error responding to challenge invite:', err);
    res.status(500).json({ message: 'Failed to respond to invite', error: err.message });
  }
};

// Get challenges (invites) relevant to the current user
exports.getUserChallenges = async (req, res) => {
  try {
    const userId = req.user._id;
    const challenges = await ChallengeInvite.find({
      'participants.user': userId // User is one of the participants
    })
    .populate('createdBy', 'username name profilePicture')
    .populate('participants.user', 'username name profilePicture')
    .populate('challengeDefinition.challengeId') // Populate if linked to a template
    .sort({ createdAt: -1 });

    res.status(200).json(challenges);
  } catch (err) {
    console.error('Error fetching user challenges:', err);
    res.status(500).json({ message: 'Failed to fetch user challenges', error: err.message });
  }
};

// --- Controller functions for UserChallengeProgress ---

// Get progress for a specific user on a specific (template) challenge
exports.getUserChallengeProgress = async (req, res) => {
    try {
        const { challengeId } = req.params; // This is Challenge Template ID
        const userId = req.user._id;

        const progress = await UserChallengeProgress.findOne({ user: userId, challenge: challengeId })
            .populate('challenge');

        if (!progress) {
            // Check if challenge template exists to provide better error or default progress
            const challengeTemplate = await Challenge.findById(challengeId);
            if (!challengeTemplate) return res.status(404).json({ message: 'Challenge template not found.' });
            // Return a default/empty progress if user hasn't started
            return res.status(200).json({
                user: userId,
                challenge: challengeTemplate,
                progress: {},
                isCompleted: false
            });
        }
        res.status(200).json(progress);
    } catch (error) {
        console.error('Error fetching user challenge progress:', error);
        res.status(500).json({ message: 'Server error fetching progress.', error: error.message });
    }
};

// This is the internal endpoint that was hit by the old challengeTracker.
// It's better handled by direct function calls now (updateUserChallengeProgress in challengeTracker.util.js)
// However, if an explicit API endpoint is still desired for some reason:
exports.recordProgressViaApi = async (req, res) => {
    const { userId, challengeId, field, increment } = req.body; // Assuming body contains this data
    // TODO: Add strong authentication/authorization for this internal-like endpoint if exposed

    // It's better to call the utility function directly if this is for internal server events
    // const { updateUserChallengeProgress } = require('./challengeTracker.util.js');
    // const progress = await updateUserChallengeProgress(userId, challengeId, field, increment);

    // For now, just a placeholder acknowledging the old pattern
    console.warn("recordProgressViaApi endpoint was called. This should ideally be an internal service call.");
    res.status(501).json({ message: "Not implemented. Use internal service calls for progress." });
};


// Get all progress entries for a user (admin or self)
exports.getAllUserProgressEntries = async (req, res) => {
    try {
        const userIdToQuery = req.params.userId || req.user._id;
        // Add admin check if req.params.userId is different from req.user._id
        if (req.params.userId && req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Not authorized to view this user\'s progress.' });
        }

        const progressEntries = await UserChallengeProgress.find({ user: userIdToQuery })
            .populate('challenge', 'title type');
        res.status(200).json(progressEntries);
    } catch (error) {
        console.error('Error fetching all user progress entries:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
