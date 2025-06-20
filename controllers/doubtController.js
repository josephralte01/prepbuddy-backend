const Doubt = require("../models/Doubt");
const { Configuration, OpenAIApi } = require("openai");

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

exports.askDoubt = async (req, res) => {
  const { question, subject, topic } = req.body;

  if (!question || !subject || !topic) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const prompt = `You are a helpful tutor. Answer the following doubt in a clear, step-by-step way.

Subject: ${subject}
Topic: ${topic}
Question: ${question}
    
Answer:`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 512
    });

    const aiAnswer = completion.data.choices[0].message.content.trim();

    const saved = await Doubt.create({
      user: req.user._id,
      subject,
      topic,
      question,
      aiAnswer
    });

    res.json(saved);
  } catch (err) {
    console.error("AI Error:", err.response?.data || err.message);
    res.status(500).json({ message: "AI failed to answer. Please try again." });
  }
};

exports.getMyDoubts = async (req, res) => {
  const doubts = await Doubt.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(doubts);
};
