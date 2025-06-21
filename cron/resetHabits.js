const cron = require("node-cron");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Corrected path assuming cron script is run from the project root
const DailyTaskTracker = require("../src/habits/dailyTaskTracker.model.js");

dotenv.config({ path: require('path').resolve(__dirname, '../.env') }); // Ensure .env is loaded

async function runDailyTaskReset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for daily task reset cron job.');

    // The original logic deleted trackers not matching today's date string.
    // A more robust way for daily reset is to ensure that for each user,
    // a new DailyTaskTracker for 'today' is created if they log in or when this job runs.
    // The old logic might delete trackers from users in different timezones prematurely.
    // For now, sticking to similar logic: delete trackers older than today.

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Delete DailyTaskTracker documents whose 'date' field is before the start of today.
    const result = await DailyTaskTracker.deleteMany({ date: { $lt: startOfToday } });
    console.log(`Old daily task trackers cleared: ${result.deletedCount} document(s) removed.`);

    // Optionally, create new trackers for active users, but this is better handled
    // by the application logic when a user accesses their daily tasks.

    await mongoose.disconnect();
    console.log('MongoDB disconnected for daily task reset cron job.');

  } catch (err) {
    console.error("Error resetting daily tasks:", err);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Schedule to run at midnight server time.
cron.schedule("0 0 * * *", () => {
  console.log("Running daily task reset cron job...");
  runDailyTaskReset();
}, {
  scheduled: true,
  timezone: "Etc/UTC" // Example: Use UTC or your server's primary timezone
});

console.log("Daily task reset cron job scheduled.");
// Keep the process alive if node-cron needs it, or manage with PM2/etc.
// For a simple script, it might exit if not kept alive by the scheduler.
// If this script is run once and exits, the cron won't persist.
// Typically, a cron runner service (like system cron) executes this script file daily.
// If using node-cron within a long-running app, this setup is fine.
// For a standalone script, it would need to be invoked daily by an external scheduler.
// The current setup with node-cron implies it's part of a running Node.js application.
