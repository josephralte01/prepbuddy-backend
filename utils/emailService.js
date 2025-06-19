// === utils/emailService.js ===
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, name, link) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const message = {
    from: `PrepBuddy <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your PrepBuddy account',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for signing up for PrepBuddy. Please click the link below to verify your email:</p>
      <a href="${link}" target="_blank">Verify Email</a>
      <p>If you did not create this account, you can safely ignore this email.</p>
    `
  };

  await transporter.sendMail(message);
};

module.exports = sendVerificationEmail;
