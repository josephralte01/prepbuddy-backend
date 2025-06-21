const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Corrected paths assuming cron script is run from the project root
const User = require('../src/users/user.model.js'); // Adjusted path
const { sendEmail } = require('../src/shared/utils/emailService.js'); // Adjusted path
const { getUsersNeedingStreakReminder } = require('../src/xp/streak.util.js'); // Adjusted path

dotenv.config({ path: require('path').resolve(__dirname, '../.env') }); // Ensure .env is loaded correctly from potentially different execution context

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // Use MONGODB_URI from .env
    console.log('MongoDB connected for cron job.');

    const users = await getUsersNeedingStreakReminder();

    if (users.length === 0) {
      console.log('✅ No users need streak reminders today.');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    console.log(`Sending streak reminders to ${users.length} users...`);

    for (const user of users) {
      // Basic check to prevent spamming if streak is already very high or user inactive for long
      // This logic can be enhanced based on specific product decisions
      if ((user.streak || 0) > 0 && (user.streak || 0) < 100) { // Example: only remind if streak is between 1-99
         await sendEmail({
            to: user.email,
            subject: '⏰ Don’t lose your PrepBuddy streak!',
            html: `
              <p>Hi ${user.name || 'there'},</p>
              <p>We noticed you might be close to losing your study streak of ${user.streak || 'days'}! 🔥</p>
              <p>Keep up the great work by completing an activity today.</p>
              <p>– The PrepBuddy Team</p>
            `,
          });
          console.log(`Reminder sent to ${user.email}`);
      }
    }

    console.log(`✅ Reminders processing complete for ${users.length} users.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error sending streak reminders:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
