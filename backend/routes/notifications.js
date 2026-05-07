// ============================================================
// routes/notifications.js — 4.2.12
// ============================================================
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Notification } = require('../models/Notification');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'Marked as read.' });
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ message: 'All marked as read.' });
  } catch (err) { next(err); }
});

module.exports = router;
