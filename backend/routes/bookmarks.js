const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CourseBookmark = require('../models/CourseBookmark');

router.use(protect);

// GET /api/bookmarks — 4.2.11
router.get('/', async (req, res, next) => {
  try {
    const bookmarks = await CourseBookmark.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ bookmarks });
  } catch (err) { next(err); }
});

// POST /api/bookmarks
router.post('/', async (req, res, next) => {
  try {
    const bookmark = await CourseBookmark.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ bookmark });
  } catch (err) { next(err); }
});

// PUT /api/bookmarks/:id — Partial update (only sent fields; avoids wiping note/tags)
router.put('/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.personalNote !== undefined) updates.personalNote = req.body.personalNote;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;
    const bookmark = await CourseBookmark.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found.' });
    if (Object.keys(updates).length === 0) {
      return res.json({ bookmark });
    }
    Object.assign(bookmark, updates);
    await bookmark.save();
    res.json({ bookmark });
  } catch (err) { next(err); }
});

// DELETE /api/bookmarks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await CourseBookmark.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Bookmark removed.' });
  } catch (err) { next(err); }
});

module.exports = router;
