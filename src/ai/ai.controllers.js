const {
  fetchSyllabus,
  fetchMaterials,
  fetchPYQs
} = require('./ai.services.js'); // Updated path

const checkTier = require('../../shared/middleware/checkTierAccess.js'); // Updated path

exports.getSyllabus = async (req, res) => {
  try {
    const { exam } = req.body;
    if (!exam) return res.status(400).json({ error: "Exam is required." });

    const syllabus = await fetchSyllabus(exam);
    res.status(200).json({ syllabus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required." });

    const materials = await fetchMaterials(topic);
    res.status(200).json({ materials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPYQs = [
  checkTier('premium'),
  async (req, res) => {
    try {
      const { exam } = req.body;
      if (!exam) return res.status(400).json({ error: "Exam is required." });

      const pyqs = await fetchPYQs(exam);
      res.status(200).json({ pyqs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
