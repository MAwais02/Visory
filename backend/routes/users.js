// ============================================================
// routes/users.js
// ============================================================
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// GET /api/users/me
router.get('/me', (req, res) => res.json({ user: req.user.toPublicJSON() }));

// PUT /api/users/me/profile — 4.2.2 User Profile Setup
router.put('/me/profile', async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar', 'profile', 'notificationPrefs'];
    allowed.forEach(f => { if (req.body[f] !== undefined) req.user[f] = req.body[f]; });
    await req.user.save({ validateBeforeSave: false });
    res.json({ user: req.user.toPublicJSON() });
  } catch (err) { next(err); }
});

// PUT /api/users/me/password
router.put('/me/password', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword)))
      return res.status(400).json({ error: 'Current password incorrect.' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch (err) { next(err); }
});

module.exports = router;
