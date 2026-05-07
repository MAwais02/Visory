const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const { Notification } = require('../models/Notification');
const Bookmark = require('../models/Bookmark');

router.use(protect, adminOnly);

// GET /api/admin/stats — System analytics
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, totalCourses, completedCourses, totalQuizzes] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Course.countDocuments({ status: 'completed' }),
      Quiz.countDocuments(),
    ]);

    // New users last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // User growth chart (last 7 days)
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      stats: { totalUsers, activeUsers, totalCourses, completedCourses, totalQuizzes, newUsers },
      userGrowth,
    });
  } catch (err) { next(err); }
});

// GET /api/admin/users — List all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken')
      .skip((page - 1) * limit).limit(Number(limit)).sort('-createdAt');
    const total = await User.countDocuments(filter);

    const userIds = users.map((u) => u._id);
    const courseCounts = await Course.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const courseCountMap = new Map(courseCounts.map((e) => [String(e._id), e.count]));

    const usersWithCounts = users.map((u) => ({
      ...u.toObject(),
      coursesGenerated: courseCountMap.get(String(u._id)) || 0,
    }));

    res.json({ users: usersWithCounts, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// PATCH /api/admin/users/:id — Manage user
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { isActive, role } = req.body;

    // Prevent admin from deactivating themselves
    if (String(req.user._id) === String(req.params.id) && isActive === false) {
      return res.status(400).json({ error: 'You cannot deactivate your own admin account.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, { isActive, role }, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) { next(err); }
});

// DELETE /api/admin/users/:id — Delete user + cleanup
router.delete('/users/:id', async (req, res, next) => {
  try {
    const targetId = req.params.id;

    // Prevent admin from deleting themselves
    if (String(req.user._id) === String(targetId)) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await Promise.all([
      Course.deleteMany({ userId: targetId }),
      Progress.deleteMany({ userId: targetId }),
      Quiz.deleteMany({ userId: targetId }),
      Bookmark.deleteMany({ userId: targetId }),
      Notification.deleteMany({ userId: targetId }),
    ]);

    await User.deleteOne({ _id: targetId });

    res.json({ message: 'User deleted.' });
  } catch (err) { next(err); }
});

// GET /api/admin/courses — All courses
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate('userId', 'name email')
      .select('title subject status completionPercentage createdAt userId')
      .sort('-createdAt').limit(100);
    res.json({ courses });
  } catch (err) { next(err); }
});

module.exports = router;
