const mongoose = require('mongoose');

// ─── Notification Model ────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['study_reminder', 'milestone', 'course_update', 'quiz_available', 'streak', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  // for scheduled reminders
  scheduledFor: Date,
  isSent: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

// ─── Bookmark Model ────────────────────────────────────────────────────────────
const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  topicId: mongoose.Schema.Types.ObjectId,
  resource: {
    title: String,
    url: String,
    type: String,
    platform: String,
    thumbnail: String,
  },
  personalNote: String,
  tags: [String],
}, { timestamps: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = { Notification, Bookmark };
