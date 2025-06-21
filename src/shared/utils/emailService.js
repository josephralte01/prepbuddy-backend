const nodemailer = require('nodemailer');
const config = require('../config/env.js'); // Import config

exports.sendEmail = async ({ to, subject, html }) => {
  if (!config.email.from || !config.email.pass) {
    console.error("Email service is not configured. Please set EMAIL_FROM and EMAIL_PASS in .env");
    // Depending on desired behavior, either throw an error or return a failure indicator
    // For critical emails (like verification), throwing might be appropriate.
    // For less critical ones, logging and returning might be okay.
    // throw new Error("Email service not configured.");
    return Promise.resolve({ success: false, message: "Email service not configured."}); // Example: don't break app if email fails
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail', // This can be made configurable too via config.email.service, config.email.host etc.
    auth: {
      user: config.email.from,
      pass: config.email.pass,
    },
  });

  await transporter.sendMail({
    from: `"PrepBuddy" <${config.email.from}>`,
    to,
    subject,
    html,
  });
};
