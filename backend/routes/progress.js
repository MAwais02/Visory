const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

router.use(protect);

// GET /api/progress/course/:courseId — 4.2.7
router.get('/course/:courseId', async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id, courseId: req.params.courseId });
    if (!progress) return res.status(404).json({ error: 'Progress not found.' });
    res.json({ progress });
  } catch (err) { next(err); }
});

// GET /api/progress/dashboard — 4.2.14 Dashboard analytics
router.get('/dashboard', async (req, res, next) => {
  try {
    const allProgress = await Progress.find({ userId: req.user._id });
    const courses = await Course.find({ userId: req.user._id, isActive: true }).select('title status completionPercentage estimatedTotalHours');

    const stats = {
      totalCourses: courses.length,
      completedCourses: courses.filter(c => c.status === 'completed').length,
      inProgressCourses: courses.filter(c => c.status === 'active').length,
      totalTimeSpent: allProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
      currentStreak: allProgress.reduce((max, p) => Math.max(max, p.currentStreak), 0),
      longestStreak: allProgress.reduce((max, p) => Math.max(max, p.longestStreak), 0),
      totalAchievements: allProgress.reduce((sum, p) => sum + p.achievements.length, 0),
      averageCompletion: courses.length
        ? Math.round(courses.reduce((sum, c) => sum + c.completionPercentage, 0) / courses.length)
        : 0,
    };

    // Weekly study data for chart (last 7 days)
    const now = new Date();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const total = allProgress.reduce((sum, p) => {
        const log = p.studyLog.find(l => l.date?.toISOString().split('T')[0] === dateStr);
        return sum + (log?.minutesSpent || 0);
      }, 0);
      return { date: dateStr, minutes: total };
    });

    res.json({ stats, courses, weeklyData, allProgress });
  } catch (err) { next(err); }
});

// POST /api/progress/log — Log study session
router.post('/log', async (req, res, next) => {
  try {
    const { courseId, minutesSpent, topicsStudied } = req.body;

    const progress = await Progress.findOne({ userId: req.user._id, courseId });
    if (!progress) return res.status(404).json({ error: 'Progress record not found.' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingLog = progress.studyLog.find(l => l.date?.getTime() === today.getTime());

    if (existingLog) {
      existingLog.minutesSpent += minutesSpent;
      existingLog.topicsStudied.push(...(topicsStudied || []));
    } else {
      progress.studyLog.push({ date: today, minutesSpent, topicsStudied: topicsStudied || [] });
      progress.totalDaysStudied += 1;
    }

    progress.totalTimeSpent += minutesSpent;
    progress.lastStudiedAt = new Date();

    // Update streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const studiedYesterday = progress.studyLog.some(l => l.date?.getTime() === yesterday.getTime());
    if (studiedYesterday || progress.studyLog.length === 1) {
      progress.currentStreak += 1;
      if (progress.currentStreak > progress.longestStreak) progress.longestStreak = progress.currentStreak;
    } else {
      progress.currentStreak = 1;
    }

    await progress.save();
    res.json({ progress });
  } catch (err) { next(err); }
});

module.exports = router;
