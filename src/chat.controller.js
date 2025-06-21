const ChatMessage = require('./chatMessage.model.js'); // Updated path (relative to src/)
const User = require('./users/user.model.js'); // Updated path (relative to src/)

exports.sendMessage = async (req, res) => {
  const { toUserId, content } = req.body; // Renamed 'to' to 'toUserId' for clarity
  const fromUserId = req.user._id;

  if (!toUserId || !content || content.trim() === "") {
    return res.status(400).json({ message: 'Recipient ID and message content are required.' });
  }

  if (fromUserId.toString() === toUserId.toString()) {
    return res.status(400).json({ message: 'You cannot send a message to yourself.' });
  }

  try {
    // Check if recipient user exists
    const recipientUser = await User.findById(toUserId);
    if (!recipientUser) {
        return res.status(404).json({ message: 'Recipient user not found.' });
    }

    // conversationId will be set by pre-save hook in the model
    const message = await ChatMessage.create({
        from: fromUserId,
        to: toUserId,
        content
    });

    // Emit to receiver via socket
    const io = req.app.get('io');
    if (io) {
        const populatedMessage = await ChatMessage.findById(message._id)
            .populate('from', 'username name profilePicture')
            .populate('to', 'username name profilePicture'); // Populate for socket payload

        io.to(toUserId.toString()).emit('chat:new_message', populatedMessage);
        // Also emit to sender if they have multiple sessions or for confirmation
        io.to(fromUserId.toString()).emit('chat:message_sent', populatedMessage);
    }

    // For the HTTP response, populate sender details for the client
    const responseMessage = await ChatMessage.findById(message._id)
        .populate('from', 'username name profilePicture');

    res.status(201).json({ message: responseMessage });
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ message: 'Server error sending message.' });
  }
};

exports.getChatHistory = async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.otherUserId; // Changed from userId to otherUserId for clarity

  if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required."});
  }

  try {
    const conversationId = ChatMessage.getConversationId(currentUserId, otherUserId);

    const messages = await ChatMessage.find({ conversationId })
      .populate('from', 'username name profilePicture') // Populate sender details
      .populate('to', 'username name profilePicture')   // Populate receiver details (optional, but can be useful)
      .sort({ createdAt: 1 }) // Sort by 'createdAt' from timestamps:true
      .lean(); // Use .lean() for performance if not modifying docs

    // Optionally, mark messages as read when fetched
    // await ChatMessage.updateMany(
    //   { conversationId: conversationId, to: currentUserId, readAt: null },
    //   { $set: { readAt: new Date() } }
    // );
    // Consider doing this via a separate "mark as read" endpoint or socket event for efficiency

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Get Chat History Error:', err);
    res.status(500).json({ message: 'Server error fetching chat history.' });
  }
};

// Mark messages in a conversation as read by the current user
exports.markMessagesAsRead = async (req, res) => {
    const currentUserId = req.user._id;
    const { conversationId, lastReadMessageTimestamp } = req.body; // or otherUserId to form conversationId

    if (!conversationId) { // Alternatively, construct from otherUserId if provided
        return res.status(400).json({ message: "Conversation ID is required." });
    }

    try {
        const updateQuery = {
            conversationId: conversationId,
            to: currentUserId,
            readAt: null // Only update unread messages
        };
        // If lastReadMessageTimestamp is provided, only mark messages up to that point as read
        if (lastReadMessageTimestamp) {
            updateQuery.createdAt = { $lte: new Date(lastReadMessageTimestamp) };
        }

        const result = await ChatMessage.updateMany(updateQuery, { $set: { readAt: new Date() } });

        // Notify the other user in the conversation that messages have been read (optional)
        // const chat = await ChatMessage.findOne({conversationId}); // to find the other user
        // if(chat && req.app.get('io')){
        //    const otherUser = chat.from.equals(currentUserId) ? chat.to : chat.from;
        //    req.app.get('io').to(otherUser.toString()).emit('chat:messages_read', { conversationId, readerId: currentUserId });
        // }

        res.status(200).json({ message: `${result.modifiedCount} messages marked as read.` });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({ message: 'Error marking messages as read.' });
    }
};

// Get list of recent conversations for the current user
exports.getConversations = async (req, res) => {
    const currentUserId = req.user._id;
    try {
        // Find messages where the user is either sender or receiver,
        // group by conversationId, and get the last message for each.
        const conversations = await ChatMessage.aggregate([
            { $match: { $or: [{ from: currentUserId }, { to: currentUserId }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" },
                    // unreadCount: { // Calculate unread messages for this user in this conversation
                    //     $sum: {
                    //         $cond: [ { $and: [ { $eq: ["$to", currentUserId] }, { $eq: ["$readAt", null] } ] }, 1, 0]
                    //     }
                    // }
                }
            },
            { $replaceRoot: { newRoot: "$lastMessage" } }, // Get the full last message document
            { $sort: { createdAt: -1 } }, // Sort conversations by the newest message
            {
                $lookup: { // Populate 'from' user details
                    from: 'users',
                    localField: 'from',
                    foreignField: '_id',
                    as: 'fromUserDetails'
                }
            },
            { $unwind: '$fromUserDetails' },
            {
                $lookup: { // Populate 'to' user details
                    from: 'users',
                    localField: 'to',
                    foreignField: '_id',
                    as: 'toUserDetails'
                }
            },
            { $unwind: '$toUserDetails' },
            { // Determine the 'other' user in the conversation
                $project: {
                    content: 1,
                    createdAt: 1,
                    readAt: 1,
                    from: '$fromUserDetails.username', // Just username or minimal info
                    to: '$toUserDetails.username',
                    conversationId: 1,
                    otherUser: {
                        $cond: {
                           if: { $eq: ["$from", currentUserId] },
                           then: { _id: "$toUserDetails._id", username: "$toUserDetails.username", name: "$toUserDetails.name", profilePicture: "$toUserDetails.profilePicture" },
                           else: { _id: "$fromUserDetails._id", username: "$fromUserDetails.username", name: "$fromUserDetails.name", profilePicture: "$fromUserDetails.profilePicture" }
                        }
                    },
                    isSenderMe: { $eq: ["$from", currentUserId] },
                    isReadByMe: { // Check if the last message (which could be mine) needs a 'read' status from my perspective
                        $cond: {
                            if: { $eq: ["$to", currentUserId] }, // If I am the recipient
                            then: { $ne: ["$readAt", null] },    // Then check if I read it
                            else: true // If I am the sender, it's 'read' from my perspective
                        }
                    }
                    // unreadCount: '$unreadCount' // If calculated in $group stage
                }
            }
        ]);
        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: 'Server error fetching conversations.' });
    }
};
