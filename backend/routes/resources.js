const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

// Placeholder for real YouTube/Coursera API integration
// For now returns AI-generated resources via the course route
router.get('/search', async (req, res, next) => {
  try {
    const { query, platform, type } = req.query;
    // In production: call YouTube Data API, Coursera API etc.
    res.json({ message: 'Use POST /api/courses/:id/topics/:topicIndex/resources for AI resource recommendations.' });
  } catch (err) { next(err); }
});

module.exports = router;
