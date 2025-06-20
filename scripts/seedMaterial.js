const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Material = require('../models/Material');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => seedMaterials())
  .catch(err => console.error('❌ DB connection failed:', err));

async function seedMaterials() {
  try {
    await Material.deleteMany(); // Optional: clear existing data

    const materials = [
      {
        chapterId: "6853ef6e74534d7ea7271d01",
        bulletPoints: ["Intro to Matter", "States of matter", "Properties"],
      },
      {
        chapterId: "6853ef7295ef9166d98117b7",
        bulletPoints: ["Atoms & Molecules", "Laws of Chemical Combination"],
      },
    ];

    await Material.insertMany(materials);
    console.log('✅ Material seeding complete!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}
