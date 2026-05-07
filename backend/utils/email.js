const nodemailer = require('nodemailer');
const { Notification } = require('../models/Notification');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Visory" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  });
};

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Visory account',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#6366f1">Visory</h2>
        <p>Please verify your email address to get started.</p>
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">Verify Email</a>
        <p style="color:#666;font-size:14px;">Link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your Visory password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#6366f1">Password Reset</h2>
        <p>Click below to reset your password. This link expires in 10 minutes.</p>
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
      </div>
    `,
  });
};

// 4.2.12 - Daily reminder cron job
const sendDailyReminders = async () => {
  const users = await User.find({
    isActive: true,
    'notificationPrefs.emailReminders': true,
  });

  for (const user of users) {
    // Create in-app notification
    await Notification.create({
      userId: user._id,
      type: 'study_reminder',
      title: 'Time to learn!',
      message: 'Keep your streak going — your courses are waiting.',
      link: '/dashboard',
    });

    // Send email
    if (user.notificationPrefs?.emailReminders) {
      sendEmail({
        to: user.email,
        subject: '📚 Your daily learning reminder',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
            <h2 style="color:#6366f1">Hi ${user.name}!</h2>
            <p>Don't forget to study today and keep your streak alive.</p>
            <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Go to Dashboard</a>
          </div>
        `,
      }).catch(console.error);
    }
  }
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendDailyReminders };
