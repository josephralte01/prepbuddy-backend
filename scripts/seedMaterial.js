const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Assuming the script is run from the project root
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });


const Material = require('../src/material.model.js'); // Updated path
// const Chapter = require('../src/exams/chapter.model.js'); // Needed if using actual chapter names/IDs

async function seedMaterials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for material seeding.');

    await Material.deleteMany({}); // Clear existing data
    console.log('Cleared existing materials.');

    // Example: Fetch actual Chapter ObjectIds to use in materials
    // This requires Chapter model and seeded chapters. For simplicity, using placeholder ObjectIds.
    // const chapter1 = await Chapter.findOne({ name: "Some Chapter Name From Exams Domain" });
    // const chapter2 = await Chapter.findOne({ name: "Another Chapter Name" });
    // For now, using placeholder IDs. THESE WILL LIKELY NOT MATCH ACTUAL DB IDs.
    const placeholderChapterId1 = new mongoose.Types.ObjectId();
    const placeholderChapterId2 = new mongoose.Types.ObjectId();


    const materialsToSeed = [
      {
        title: "Introduction to Matter",
        chapter: placeholderChapterId1, // Was chapterId
        // subject: someSubjectId, // Ideally link to Subject and ExamCategory too
        // examCategory: someExamCategoryId,
        materialType: 'notes',
        bulletPoints: ["Definition of Matter", "States of matter (Solid, Liquid, Gas)", "Basic properties of matter"],
        isPublic: true,
      },
      {
        title: "Atoms and Molecules",
        chapter: placeholderChapterId2, // Was chapterId
        materialType: 'notes',
        bulletPoints: ["What are atoms?", "What are molecules?", "Dalton's Atomic Theory", "Laws of Chemical Combination"],
        isPublic: true,
      },
      // Add more materials with new fields if needed
    ];

    await Material.insertMany(materialsToSeed);
    console.log(`✅ ${materialsToSeed.length} materials seeded successfully!`);

  } catch (err) {
    console.error('❌ Material seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

seedMaterials();
