const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// ─── Validation ────────────────────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// ─── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name, email, password,
      emailVerificationToken: verificationToken,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, verificationToken).catch(console.error);

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) { next(err); }
});

// ─── GET /api/auth/verify-email/:token ────────────────────────────────────────
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const user = await User.findOne({ emailVerificationToken: req.params.token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification token.' });
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });
    res.json({ message: 'Email verified successfully.' });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', body('email').isEmail(), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });

    sendPasswordResetEmail(user.email, resetToken).catch(console.error);
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/reset-password/:token ─────────────────────────────────────
router.post('/reset-password/:token',
  body('password').isLength({ min: 8 }),
  async (req, res, next) => {
    try {
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
      if (!user) return res.status(400).json({ error: 'Token invalid or expired.' });

      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.json({ message: 'Password reset successful.' });
    } catch (err) { next(err); }
  }
);

// ─── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
