const Topic = require('./topic.model.js'); // Updated path
const Subject = require('./subject.model.js'); // Updated path
const slugify = require('slugify');

// Create new topic
const createTopic = async (req, res) => {
  try {
    const { name, description, subjectId, content, order } = req.body;

    if (!name || !subjectId) {
      return res.status(400).json({ error: 'Name and Subject ID are required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const slug = slugify(name, { lower: true });

    const topic = await Topic.create({
      name,
      description,
      subject: subjectId,
      slug,
      content,
      order: order || 0,
      createdBy: req.user?.userId || null // Ensure req.user is populated by authMiddleware
    });

    res.status(201).json({ topic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all topics
const getAllTopics = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = { isActive: true };
    if (subjectId) filter.subject = subjectId;

    const topics = await Topic.find(filter)
      .populate('subject', 'name slug')
      .sort({ order: 1 });

    res.status(200).json({ topics, count: topics.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single topic
const getTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('subject', 'name slug');

    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    res.status(200).json({ topic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update topic
const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subjectId, content, order, isActive } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }
    if (description) updateData.description = description;
    if (content) updateData.content = content;
    if (typeof order === 'number') updateData.order = order;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });
      updateData.subject = subjectId;
    }

    const topic = await Topic.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('subject', 'name slug');

    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    res.status(200).json({ topic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete topic
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTopic,
  getAllTopics,
  getTopic,
  updateTopic,
  deleteTopic
};
