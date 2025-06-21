const { OpenAI } = require('openai');
const redis = require('../../shared/utils/redis.js'); // Updated path, will use config internally
const config = require('../../shared/config/env.js'); // Import config

const openai = new OpenAI({
  apiKey: config.openai.apiKey // Use config
});

// Helper: Check Redis first
async function getCachedOrGenerate(key, prompt) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  const content = response.choices[0].message.content;
  await redis.setEx(key, 60 * 60 * 24 * 3, JSON.stringify(content)); // 3 days cache

  return content;
}

exports.fetchSyllabus = async (exam) => {
  const prompt = `Give me the full official syllabus for the ${exam} exam in India as a bullet-pointed list.`;
  return await getCachedOrGenerate(`syllabus:${exam}`, prompt);
};

exports.fetchMaterials = async (topic) => {
  const prompt = `Give concise bullet-point study material for the topic: ${topic}. Keep it short and easy to revise.`;
  return await getCachedOrGenerate(`material:${topic}`, prompt);
};

exports.fetchPYQs = async (exam) => {
  const prompt = `Give 5 previous year questions with answers for the ${exam} exam.`;
  return await getCachedOrGenerate(`pyq:${exam}`, prompt);
};
