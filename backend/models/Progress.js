const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // 4.2.7 - Progress Tracking
  topicsCompleted: [mongoose.Schema.Types.ObjectId],
  subtopicsCompleted: [mongoose.Schema.Types.ObjectId],
  resourcesViewed: [String], // URLs
  totalTimeSpent: { type: Number, default: 0 }, // minutes
  lastStudiedAt: Date,

  // Daily study log
  studyLog: [{
    date: Date,
    minutesSpent: Number,
    topicsStudied: [String],
  }],

  // Weekly stats
  currentStreak: { type: Number, default: 0 },    // days
  longestStreak: { type: Number, default: 0 },
  totalDaysStudied: { type: Number, default: 0 },

  // Achievements / Milestones
  achievements: [{
    title: String,
    description: String,
    icon: String,
    earnedAt: Date,
  }],

  completionPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
}, { timestamps: true });

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
