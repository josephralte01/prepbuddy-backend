const cron = require("node-cron");
const HabitTracker = require("../models/HabitTracker");

cron.schedule("0 0 * * *", async () => {
  const today = new Date().toDateString();
  try {
    await HabitTracker.deleteMany({ date: { $ne: today } });
    console.log("Old habits cleared.");
  } catch (err) {
    console.error("Error resetting habits:", err);
  }
});
