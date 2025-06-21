// Paths relative to src/
const Topic = require('./exams/topic.model.js');
const Question = require('./exams/question.model.js');
const Subject = require('./exams/subject.model.js');
const ExamCategory = require('./exams/examCategory.model.js');
const MockTest = require('./exams/mockTest.model.js');
// const Material = require('./material.model.js'); // Example: if materials were searchable
// const User = require('./users/user.model.js'); // Example: if users were searchable

const SEARCHABLE_MODELS_CONFIG = [
    {
        model: ExamCategory,
        fields: ['name', 'description'],
        itemType: 'examCategory',
        isActiveField: 'isActive',
        populate: []
    },
    {
        model: Subject,
        fields: ['name', 'description'],
        itemType: 'subject',
        isActiveField: 'isActive',
        populate: [{ path: 'examCategory', select: 'name slug' }]
    },
    {
        model: Topic,
        fields: ['name', 'description', 'content'],
        itemType: 'topic',
        isActiveField: 'isActive',
        populate: [{ path: 'subject', select: 'name slug' }]
    },
    {
        model: Question,
        fields: ['text', 'explanation'], // options might be too noisy
        itemType: 'question',
        isActiveField: 'isActive',
        populate: [
            { path: 'subject', select: 'name slug' },
            { path: 'examCategory', select: 'name slug' }
        ]
    },
    {
        model: MockTest,
        fields: ['title', 'description'],
        itemType: 'mockTest',
        isActiveField: 'isActive',
        populate: [{ path: 'examCategory', select: 'name slug' }]
    },
    // {
    //     model: Material,
    //     fields: ['title', 'description', 'bulletPoints'],
    //     itemType: 'material',
    //     isActiveField: 'isPublic', // or isActive if material has it
    //     populate: [{ path: 'chapter', select: 'name'}, {path: 'subject', select: 'name'}]
    // }
];


exports.search = async (req, res) => {
  try {
    const { query, types, limit = 5 } = req.query; // 'types' can be a comma-separated string

    if (!query || query.trim().length < 2) { // Basic query validation
      return res.status(400).json({ message: 'Search query must be at least 2 characters long.' });
    }

    const searchOptions = { $regex: query, $options: 'i' };
    let results = [];
    const requestedItemTypes = types ? types.split(',') : null;

    for (const config of SEARCHABLE_MODELS_CONFIG) {
        if (requestedItemTypes && !requestedItemTypes.includes(config.itemType)) {
            continue; // Skip if this itemType is not requested
        }

        const orConditions = config.fields.map(field => ({ [field]: searchOptions }));
        const findQuery = { $or: orConditions };
        if (config.isActiveField) { // Only search active/public items
            findQuery[config.isActiveField] = true;
        }

        let queryBuilder = config.model.find(findQuery).limit(parseInt(limit));
        if (config.populate && config.populate.length > 0) {
            config.populate.forEach(p => queryBuilder = queryBuilder.populate(p));
        }

        const items = await queryBuilder.lean();

        results.push(...items.map(item => ({
            ...item,
            itemType: config.itemType,
            // Standardize some common fields for display if possible
            displayTitle: item.title || item.name || item.text,
            displayDescription: item.description || (item.text ? item.text.substring(0,100) + '...' : '')
        })));
    }

    // Optional: Sort aggregated results if needed, e.g., by relevance (hard without a search engine)
    // For now, results are grouped by itemType based on loop order.
    // A simple shuffle or a more complex scoring could be applied if results are too many.
    // Or, limit total results after aggregation.
    // results.sort((a,b) => /* some relevance score */);
    if (results.length > (parseInt(limit) * (requestedItemTypes ? requestedItemTypes.length : SEARCHABLE_MODELS_CONFIG.length) / 2) && results.length > 20) {
        // Heuristic to limit total results if it gets too large from many types
        // results = results.slice(0, 20);
    }


    res.status(200).json({
      results,
      count: results.length, // Total items found across all types searched
      query
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: 'Error performing search.', error: error.message });
  }
};
