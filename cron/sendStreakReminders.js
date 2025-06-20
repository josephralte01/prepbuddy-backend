const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

(async () => {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const users = await User.find({
      lastActiveDate: { $lt: yesterday },
    }).select('name email');

    for (const user of users) {
      await sendEmail({
        to: user.email,
        subject: '⏰ Don’t lose your PrepBuddy streak!',
        html: `
          <p>Hi ${user.name},</p>
          <p>We noticed you didn’t complete anything yesterday. You’re about to lose your streak! 🔥</p>
          <p><strong>Log in today</strong> and complete a chapter to keep it going.</p>
          <p>– The PrepBuddy Team</p>
        `,
      });
    }

    console.log(`✅ Reminders sent to ${users.length} users`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error sending reminders:', err);
    process.exit(1);
  }
})();
