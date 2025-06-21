const Doubt = require("./doubt.model.js"); // Updated path (relative to src/)
const User = require("./users/user.model.js"); // Updated path (relative to src/)
// Consider moving OpenAI client to a shared service, e.g., src/ai/ai.services.js
// For now, keeping it here as it's specific to doubt resolution prompt.
const { Configuration, OpenAIApi } = require("openai");
const config = require('../shared/config/env.js'); // Import config

let openai;
if (config.openai.apiKey) {
    openai = new OpenAIApi(new Configuration({ apiKey: config.openai.apiKey }));
} else {
    console.warn("OpenAI API Key not set in config. AI doubt resolution will not work.");
}


exports.askDoubt = async (req, res) => {
  const { question, subject, topic } = req.body;
  const userId = req.user._id;

  if (!question || !subject || !topic) {
    return res.status(400).json({ message: "Question, subject, and topic are required." });
  }

  if (!openai) {
    return res.status(503).json({ message: "AI service is currently unavailable. Please try again later." });
  }

  let doubtDoc;
  try {
    // Create doubt record first with pending status
    doubtDoc = await Doubt.create({
      user: userId,
      subject,
      topic,
      question,
      status: 'pending_ai_response'
    });

    const prompt = `You are a helpful and concise tutor for competitive exams. Answer the following doubt in a clear, step-by-step way if steps are needed, or a direct explanation.

Subject: ${subject}
Topic: ${topic}
Question: ${question}

Answer:`;

    const completion = await openai.createChatCompletion({
      model: config.openai.model, // Use configured model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5, // Slightly lower for more factual answers
      max_tokens: 500   // Adjusted max_tokens
    });

    const aiAnswer = completion.data.choices[0].message.content.trim();

    doubtDoc.aiAnswer = aiAnswer;
    doubtDoc.status = 'answered_by_ai';
    await doubtDoc.save();

    res.status(201).json(doubtDoc);
  } catch (err) {
    console.error("AI Error or DB Error in askDoubt:", err.response?.data || err.message || err);
    // If doubtDoc was created but AI failed, update its status
    if (doubtDoc && doubtDoc._id) {
        await Doubt.findByIdAndUpdate(doubtDoc._id, { status: 'failed_ai_response' });
    }
    res.status(500).json({ message: "AI failed to answer or a server error occurred. Please try again." });
  }
};

exports.getMyDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ user: req.user._id })
                              .sort({ createdAt: -1 })
                              .limit(50); // Add limit for performance
    res.status(200).json(doubts);
  } catch (error) {
    console.error("Error fetching user doubts:", error);
    res.status(500).json({ message: "Server error fetching your doubts."});
  }
};

// Placeholder: Get a specific doubt by ID (e.g., for viewing details)
exports.getDoubtById = async (req, res) => {
    try {
        const doubt = await Doubt.findOne({ _id: req.params.id, user: req.user._id }); // User can only fetch their own
        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found." });
        }
        res.status(200).json(doubt);
    } catch (error) {
        console.error("Error fetching doubt by ID:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Placeholder: User rates an AI answer
exports.rateDoubtAnswer = async (req, res) => {
    try {
        const { rating } = req.body;
        const doubt = await Doubt.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, status: 'answered_by_ai' },
            { userRating: rating },
            { new: true }
        );
        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found or cannot be rated." });
        }
        res.status(200).json(doubt);
    } catch (error) {
        console.error("Error rating doubt answer:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Placeholder: Escalate doubt to a mentor
exports.escalateDoubtToMentor = async (req, res) => {
    try {
        const doubt = await Doubt.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, status: 'answered_by_ai' }, // Can only escalate AI answered doubts
            { status: 'escalated_to_mentor' /*, mentorAssigned: findAvailableMentorLogic() */ },
            { new: true }
        );
        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found or cannot be escalated." });
        }
        // TODO: Notify mentors
        res.status(200).json({ message: "Doubt escalated to mentor.", doubt });
    } catch (error) {
        console.error("Error escalating doubt:", error);
        res.status(500).json({ message: "Server error." });
    }
};
