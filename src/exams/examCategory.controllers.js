const ExamCategory = require('./examCategory.model.js'); // Updated path
const Subject = require('./subject.model.js'); // Updated path (assuming it moves to src/exams)
const Chapter = require('./chapter.model.js'); // Updated path (assuming it moves to src/exams and exists)

exports.getExamStructure = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await ExamCategory.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const subjects = await Subject.find({ examCategory: examId });

    const subjectsWithChapters = await Promise.all(
      subjects.map(async (subject) => {
        const chapters = await Chapter.find({ subject: subject._id });
        return {
          _id: subject._id,
          name: subject.name,
          chapters: chapters.map((c) => ({ _id: c._id, name: c.name })),
        };
      })
    );

    res.status(200).json({
      examId: exam._id,
      name: exam.name,
      subjects: subjectsWithChapters,
    });
  } catch (err) {
    console.error('Error getting exam structure:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
