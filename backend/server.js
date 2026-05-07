const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const cron = require('node-cron');

dotenv.config();

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const quizRoutes = require('./routes/quizzes');
const progressRoutes = require('./routes/progress');
const resourceRoutes = require('./routes/resources');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const bookmarkRoutes = require('./routes/bookmarks');

// Config imports
require('./config/passport');

const app = express();

// ─── Middleware 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'AI generation limit reached. Please try again in an hour.' },
});
app.use('/api/courses/generate', aiLimiter);
app.use('/api/quizzes/generate', aiLimiter);

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Health Check 
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

//  TEMP TEST ROUTE (delete before production) 
app.get('/test-reminders', async (req, res) => {
  try {
    const { sendDailyReminders } = require('./utils/email');
    await sendDailyReminders();
    res.json({ message: 'Reminders fired!', time: new Date().toLocaleTimeString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Error Handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

//  Scheduled Jobs 
cron.schedule('9 9 * * *', async () => {
  try {
    const { sendDailyReminders } = require('./utils/email');
    await sendDailyReminders();
    console.log('✅ Daily reminders sent at', new Date().toLocaleTimeString());
  } catch (err) {
    console.error('❌ Daily reminders failed:', err.message);
  }
});

// ─── DB + Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;